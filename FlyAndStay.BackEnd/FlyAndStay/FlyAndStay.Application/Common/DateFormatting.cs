using System.Globalization;

namespace FlyAndStay.Application.Common;

public static class DateFormatting
{
    public static string ToIso(this DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    public static string ToIso(this DateTime date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    public static string ToLocalIso(this DateTime date) => date.ToString("yyyy-MM-dd'T'HH:mm:ss", CultureInfo.InvariantCulture);
}
