// src/modules/email/templates/verification.template.ts
export interface VerificationTemplateData {
  name: string;
  verificationLink: string;
}

export const getVerificationTemplate = (data: VerificationTemplateData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; background: #ffffff; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none; }
    .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .button:hover { opacity: 0.9; transform: translateY(-2px); }
    .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
    .divider { height: 1px; background: #e9ecef; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>AI Portfolio Builder</h1></div>
    <div class="content">
      <h2>Hello ${data.name}! 👋</h2>
      <p>Welcome to AI Portfolio Builder! Please verify your email address to get started:</p>
      <div style="text-align: center;">
        <a href="${data.verificationLink}" class="button">Verify Email Address</a>
      </div>
      <p style="font-size: 14px; color: #6c757d;">
        Or copy and paste this link into your browser:<br>
        <span style="word-break: break-all;">${data.verificationLink}</span>
      </p>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6c757d;">
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© 2026 AI Portfolio Builder. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};