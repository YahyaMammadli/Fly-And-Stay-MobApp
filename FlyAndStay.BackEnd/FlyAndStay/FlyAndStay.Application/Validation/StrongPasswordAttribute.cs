using System.ComponentModel.DataAnnotations;

namespace FlyAndStay.Application.Validation;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public const int MinimumLength = 8;

    public StrongPasswordAttribute()
        : base($"Password must be at least {MinimumLength} characters long and contain letters, digits and at least one uppercase letter.")
    {
    }

    public override bool IsValid(object? value)
    {
        if (value is not string password) return value is null;

        return password.Length >= MinimumLength
            && password.Any(char.IsLetter)
            && password.Any(char.IsDigit)
            && password.Any(char.IsUpper);
    }
}
