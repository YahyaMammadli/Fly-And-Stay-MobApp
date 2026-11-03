namespace FlyAndStay.Application.Exceptions;

public sealed class ForbiddenException(string message) : AppException(message);
