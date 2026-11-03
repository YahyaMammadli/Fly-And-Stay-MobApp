using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Abstractions.Repositories;

public interface IPasswordResetCodeRepository
{
    Task AddAsync(PasswordResetCode code, CancellationToken ct);
    Task<List<PasswordResetCode>> GetUnusedByUserAsync(Guid userId, CancellationToken ct);
    Task<PasswordResetCode?> GetLatestUsableAsync(Guid userId, DateTime now, CancellationToken ct);
    Task<bool> AnyCreatedAfterAsync(Guid userId, DateTime since, CancellationToken ct);
}
