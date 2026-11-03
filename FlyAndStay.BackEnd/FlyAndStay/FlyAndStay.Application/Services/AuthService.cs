using FlyAndStay.Application.Abstractions;
using FlyAndStay.Application.Abstractions.Repositories;
using FlyAndStay.Application.Abstractions.Services;
using FlyAndStay.Application.Common;
using FlyAndStay.Application.Dtos.Auth;
using FlyAndStay.Application.Dtos.Shared;
using FlyAndStay.Application.Exceptions;
using FlyAndStay.Application.Mapping;
using FlyAndStay.Application.Models;
using FlyAndStay.Application.Settings;
using FlyAndStay.Domain.Entities;
using FlyAndStay.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FlyAndStay.Application.Services;

public sealed class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IPasswordResetCodeRepository resetCodes,
    IUnitOfWork unitOfWork,
    IPasswordHasher passwordHasher,
    IOtpService otpService,
    ITokenService tokenService,
    IEmailSender emailSender,
    INotificationDispatcher notifier,
    IOptions<JwtSettings> jwtOptions,
    IOptions<PasswordResetSettings> resetOptions,
    TimeProvider clock,
    ILogger<AuthService> logger) : IAuthService
{
    private const string EmailTaken = "An account with this email already exists.";
    private const string InvalidCode = "The code is invalid or has expired.";

    private readonly JwtSettings jwt = jwtOptions.Value;
    private readonly PasswordResetSettings reset = resetOptions.Value;

    private DateTime UtcNow => clock.GetUtcNow().UtcDateTime;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct)
    {
        var email = NormalizeEmail(request.Email);
        if (await users.EmailExistsAsync(email, ct))
            throw new ConflictException(EmailTaken);

        var hashed = passwordHasher.Hash(request.Password);
        var user = new User
        {
            Name = request.Name.Trim(),
            Email = email,
            Role = UserRole.User,
            PasswordHash = hashed.Hash,
            PasswordSalt = hashed.Salt,
            PasswordIterations = hashed.Iterations,
            CreatedAt = UtcNow
        };

        await users.AddAsync(user, ct);

        try
        {
            await unitOfWork.SaveChangesAsync(ct);
        }
        catch (ConflictException)
        {
            throw new ConflictException(EmailTaken);
        }

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct)
    {
        var user = await users.GetByEmailAsync(NormalizeEmail(request.Email), ct);

        if (user is null)
        {
            passwordHasher.BurnTime(request.Password);
            throw new UnauthorizedAppException("Incorrect email or password.");
        }

        if (!passwordHasher.Verify(request.Password, user.PasswordSalt, user.PasswordHash, user.PasswordIterations))
            throw new UnauthorizedAppException("Incorrect email or password.");

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, string? ipAddress, CancellationToken ct)
    {
        var stored = await refreshTokens.GetByHashAsync(tokenService.HashRefreshToken(refreshToken), ct)
            ?? throw new UnauthorizedAppException("Invalid refresh token.");

        var now = UtcNow;

        if (stored.IsRevoked)
        {
            await RevokeAllActiveAsync(stored.UserId, now, ct);
            await unitOfWork.SaveChangesAsync(ct);
            throw new UnauthorizedAppException("This refresh token was already used. Please log in again.");
        }

        if (now >= stored.ExpiresAt)
            throw new UnauthorizedAppException("The session has expired. Please log in again.");

        var newRaw = tokenService.GenerateRefreshToken();
        var newHash = tokenService.HashRefreshToken(newRaw);

        stored.RevokedAt = now;
        stored.ReplacedByTokenHash = newHash;

        await refreshTokens.AddAsync(CreateRefreshToken(stored.UserId, newHash, now, ipAddress), ct);
        await unitOfWork.SaveChangesAsync(ct);

        var access = tokenService.CreateAccessToken(stored.User);
        return new AuthResponse(access.Value, newRaw, access.ExpiresAt, stored.User.ToDto());
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct)
    {
        var stored = await refreshTokens.GetByHashAsync(tokenService.HashRefreshToken(refreshToken), ct);
        if (stored is null || stored.IsRevoked) return;

        stored.RevokedAt = UtcNow;
        await unitOfWork.SaveChangesAsync(ct);
    }

    public async Task LogoutAllAsync(Guid userId, CancellationToken ct)
    {
        await RevokeAllActiveAsync(userId, UtcNow, ct);
        await unitOfWork.SaveChangesAsync(ct);
    }

    public async Task<MessageResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct)
    {
        var generic = new MessageResponse("If an account with this email exists, a 6-digit code has been sent.");

        var user = await users.GetByEmailAsync(NormalizeEmail(request.Email), ct);
        if (user is null) return generic;

        var now = UtcNow;

        if (await resetCodes.AnyCreatedAfterAsync(user.Id, now.AddSeconds(-reset.ResendCooldownSeconds), ct))
            return generic;

        foreach (var previous in await resetCodes.GetUnusedByUserAsync(user.Id, ct))
            previous.Used = true;

        var code = otpService.GenerateCode();
        var hashed = otpService.Hash(code);

        await resetCodes.AddAsync(new PasswordResetCode
        {
            UserId = user.Id,
            CodeHash = hashed.Hash,
            CodeSalt = hashed.Salt,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(reset.CodeLifetimeMinutes)
        }, ct);
        await unitOfWork.SaveChangesAsync(ct);

        try
        {
            await emailSender.SendAsync(
                new EmailMessage(
                    user.Email,
                    "Your Fly&Stay password reset code",
                    EmailTemplates.ResetCode(user.Name, code, reset.CodeLifetimeMinutes)),
                ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not send the password reset e-mail to {Email}", user.Email);
        }

        return generic;
    }

    public async Task<MessageResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct)
    {
        var user = await users.GetByEmailAsync(NormalizeEmail(request.Email), ct)
            ?? throw new BadRequestException(InvalidCode);

        var now = UtcNow;
        var entry = await resetCodes.GetLatestUsableAsync(user.Id, now, ct);

        if (entry is null || entry.Attempts >= reset.MaxAttempts)
            throw new BadRequestException(InvalidCode);

        if (!otpService.Verify(request.Code, entry.CodeSalt, entry.CodeHash))
        {
            entry.Attempts++;
            if (entry.Attempts >= reset.MaxAttempts) entry.Used = true;
            await unitOfWork.SaveChangesAsync(ct);
            throw new BadRequestException(InvalidCode);
        }

        var hashed = passwordHasher.Hash(request.NewPassword);
        user.PasswordHash = hashed.Hash;
        user.PasswordSalt = hashed.Salt;
        user.PasswordIterations = hashed.Iterations;
        entry.Used = true;

        await RevokeAllActiveAsync(user.Id, now, ct);
        await unitOfWork.SaveChangesAsync(ct);

        await notifier.SendAsync(
            user.Id,
            NotificationType.PasswordChanged,
            "Password changed",
            "Your password was updated. If this was not you, reset it again right away.",
            null,
            ct);

        return new MessageResponse("Your password has been updated.");
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private RefreshToken CreateRefreshToken(Guid userId, string tokenHash, DateTime now, string? ipAddress) => new()
    {
        UserId = userId,
        TokenHash = tokenHash,
        CreatedAt = now,
        ExpiresAt = now.AddDays(jwt.RefreshTokenDays),
        CreatedByIp = ipAddress
    };

    private async Task<AuthResponse> IssueTokensAsync(User user, string? ipAddress, CancellationToken ct)
    {
        var now = UtcNow;

        refreshTokens.RemoveRange(await refreshTokens.GetExpiredByUserAsync(user.Id, now, ct));

        var raw = tokenService.GenerateRefreshToken();
        await refreshTokens.AddAsync(
            CreateRefreshToken(user.Id, tokenService.HashRefreshToken(raw), now, ipAddress),
            ct);
        await unitOfWork.SaveChangesAsync(ct);

        var access = tokenService.CreateAccessToken(user);
        return new AuthResponse(access.Value, raw, access.ExpiresAt, user.ToDto());
    }

    private async Task RevokeAllActiveAsync(Guid userId, DateTime now, CancellationToken ct)
    {
        foreach (var token in await refreshTokens.GetActiveByUserAsync(userId, ct))
            token.RevokedAt = now;
    }
}
