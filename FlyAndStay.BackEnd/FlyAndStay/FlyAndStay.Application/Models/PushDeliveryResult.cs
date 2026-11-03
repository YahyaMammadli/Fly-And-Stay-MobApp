namespace FlyAndStay.Application.Models;

public sealed record PushDeliveryResult(string To, bool Delivered, bool DeviceNotRegistered);
