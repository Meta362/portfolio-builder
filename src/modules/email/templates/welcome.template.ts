// src/modules/email/templates/welcome.template.ts
export interface WelcomeTemplateData {
  name: string;
}

export const getWelcomeTemplate = (data: WelcomeTemplateData): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
    .header { text-align: center; padding: 30px 0; background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); border-radius: 8px 8px 0 0; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .content { padding: 40px 30px; background: #ffffff; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef; border-top: none; }
    .button { display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
    .features { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .feature-item { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to AI Portfolio Builder! 🚀</h1></div>
    <div class="content">
      <h2>Welcome ${data.name}!</h2>
      <p>We're thrilled to have you on board!</p>
      <div class="features">
        <div class="feature-item">🤖 AI-Powered Content</div>
        <div class="feature-item">🎨 Beautiful Templates</div>
        <div class="feature-item">📱 Mobile Friendly</div>
        <div class="feature-item">📊 Analytics</div>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>
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