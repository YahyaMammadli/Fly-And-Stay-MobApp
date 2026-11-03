namespace FlyAndStay.Application.Exceptions;

public sealed class UnauthorizedAppException(string message) : AppException(message);
