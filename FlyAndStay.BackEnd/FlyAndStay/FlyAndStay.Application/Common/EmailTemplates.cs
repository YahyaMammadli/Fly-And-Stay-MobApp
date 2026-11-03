using System.Net;

namespace FlyAndStay.Application.Common;

public static class EmailTemplates
{
    // E-mail clients ignore <style> blocks and modern CSS, so the layout uses tables and inline styles only.
    private const string Font = "'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
    private const string Primary = "#1A66E8";
    private const string PrimaryDark = "#1457C8";
    private const string Text = "#0F1B33";
    private const string Muted = "#7A869A";
    private const string Background = "#F4F7FC";
    private const string Soft = "#EAF1FC";

    public static string ResetCode(string name, string code, int minutes)
    {
        var safeName = WebUtility.HtmlEncode(name);
        var safeCode = WebUtility.HtmlEncode(code);
        var year = DateTime.UtcNow.Year;

        return $"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="color-scheme" content="light">
          <title>Your Fly&amp;Stay password reset code</title>
        </head>
        <body style="margin:0;padding:0;background:{Background};">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{Background};">
            Your code is {safeCode}. It expires in {minutes} minutes.
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{Background};">
            <tr>
              <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">

                  <tr>
                    <td align="center" style="background:{Primary};background-image:linear-gradient(135deg,{Primary},{PrimaryDark});border-radius:24px 24px 0 0;padding:36px 24px 30px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" valign="middle" width="56" height="56" style="width:56px;height:56px;border-radius:28px;background:rgba(255,255,255,0.18);font-size:28px;line-height:56px;color:#FFFFFF;">&#9992;</td>
                        </tr>
                      </table>
                      <div style="font-family:{Font};font-size:26px;font-weight:800;color:#FFFFFF;margin-top:14px;letter-spacing:0.3px;">Fly&amp;Stay</div>
                      <div style="font-family:{Font};font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;">Flights &bull; Hotels &bull; Your Next Trip</div>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#FFFFFF;border-radius:0 0 24px 24px;padding:32px 24px 28px;box-shadow:0 12px 32px rgba(15,27,51,0.08);">
                      <div style="font-family:{Font};font-size:22px;font-weight:700;color:{Text};">Reset your password</div>
                      <p style="font-family:{Font};font-size:15px;line-height:24px;color:{Text};margin:16px 0 0;">Hi {safeName},</p>
                      <p style="font-family:{Font};font-size:15px;line-height:24px;color:{Text};margin:8px 0 0;">
                        We received a request to reset the password for your Fly&amp;Stay account. Enter this code in the app to choose a new one:
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
                        <tr>
                          <td align="center" style="background:{Soft};border:1px dashed {Primary};border-radius:18px;padding:20px 8px;">
                            <div style="font-family:{Font};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:{Primary};">Your verification code</div>
                            <div style="font-family:'Courier New',Consolas,monospace;font-size:34px;font-weight:700;letter-spacing:8px;color:{Text};margin-top:10px;padding-left:8px;white-space:nowrap;">{safeCode}</div>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="font-family:{Font};font-size:14px;line-height:22px;color:{Text};padding:12px 16px;background:{Background};border-radius:12px;">
                            &#9201;&nbsp; The code expires in <strong>{minutes} minutes</strong> and can be used only once.
                          </td>
                        </tr>
                      </table>

                      <p style="font-family:{Font};font-size:13px;line-height:21px;color:{Muted};margin:24px 0 0;">
                        Didn't ask to reset your password? You can safely ignore this e-mail &mdash; your password stays the same.
                        Never share this code with anyone, Fly&amp;Stay will never ask you for it.
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style="padding:24px 16px 0;font-family:{Font};font-size:12px;line-height:18px;color:{Muted};">
                      You received this e-mail because a password reset was requested for your Fly&amp;Stay account.<br>
                      &copy; {year} Fly&amp;Stay
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;
    }
}
