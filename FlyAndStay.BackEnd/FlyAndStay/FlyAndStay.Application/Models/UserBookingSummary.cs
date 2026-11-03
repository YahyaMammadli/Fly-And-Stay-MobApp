using FlyAndStay.Domain.Entities;

namespace FlyAndStay.Application.Models;

public sealed record UserBookingSummary(User User, int BookingsCount);
