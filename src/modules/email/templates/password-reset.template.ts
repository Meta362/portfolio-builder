// src/modules/email/templates/password-reset.template.ts
export interface PasswordResetTemplateData {
  name: string;
  resetLink: string;
}

export const getPasswordResetTemplate = (data: PasswordResetTemplateData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 8px 8px 0 0; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; background: #ffffff; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none; }
    .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { opacity: 0.9; transform: translateY(-2px); }
    .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Reset Your Password</h1></div>
    <div class="content">
      <h2>Hello ${data.name}! 🔐</h2>
      <p>We received a request to reset your password.</p>
      <div style="text-align: center;">
        <a href="${data.resetLink}" class="button">Reset Password</a>
      </div>
      <p style="font-size: 14px; color: #6c757d;">
        Or copy and paste this link:<br>
        <span style="word-break: break-all;">${data.resetLink}</span>
      </p>
      <div class="warning">
        <p style="margin: 0; font-size: 14px;">
          <strong>⚠️ Important:</strong> This link will expire in 1 hour.
        </p>
      </div>
    </div>
    <div class="footer">
      <p>© 2026 AI Portfolio Builder. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};