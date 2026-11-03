namespace FlyAndStay.Application.Exceptions;

public sealed class BadRequestException(string message) : AppException(message);
