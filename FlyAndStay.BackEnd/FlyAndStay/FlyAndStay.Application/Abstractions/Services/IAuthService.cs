using FlyAndStay.Application.Dtos.Auth;
using FlyAndStay.Application.Dtos.Shared;

namespace FlyAndStay.Application.Abstractions.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct);
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct);
    Task<AuthResponse> RefreshAsync(string refreshToken, string? ipAddress, CancellationToken ct);
    Task LogoutAsync(string refreshToken, CancellationToken ct);
    Task LogoutAllAsync(Guid userId, CancellationToken ct);
    Task<MessageResponse> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct);
    Task<MessageResponse> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct);
}
