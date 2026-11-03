using System.Net;

namespace FlyAndStay.Application.Common;

public static class EmailTemplates
{
    public static string ResetCode(string name, string code, int minutes)
    {
        var safeName = WebUtility.HtmlEncode(name);
        return $"""
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0F1B33">
          <h2 style="color:#1A66E8;margin:0 0 16px">Fly&amp;Stay</h2>
          <p>Hi {safeName},</p>
          <p>Use this code to reset your password:</p>
          <p style="font-size:34px;font-weight:700;letter-spacing:8px;margin:20px 0">{code}</p>
          <p>The code is valid for {minutes} minutes. If you did not request it, you can ignore this e-mail.</p>
        </div>
        """;
    }
}
