// src/modules/telegram/telegram.formatter.ts
export class TelegramFormatter {
  /**
   * Format message with HTML
   */
  static formatMessage(text: string, style?: 'bold' | 'italic' | 'code'): string {
    switch (style) {
      case 'bold':
        return `<b>${text}</b>`;
      case 'italic':
        return `<i>${text}</i>`;
      case 'code':
        return `<code>${text}</code>`;
      default:
        return text;
    }
  }

  /**
   * Format help message
   */
  static getHelpMessage(language: 'en' | 'km'): string {
    if (language === 'km') {
      return `
<b>🤖 ជំនួយ Telegram Bot</b>

<b>/start</b> - ចាប់ផ្តើមប្រើប្រាស់
<b>/help</b> - បង្ហាញជំនួយនេះ
<b>/status</b> - ពិនិត្យស្ថានភាព
<b>/settings</b> - កំណត់ការជូនដំណឹង
<b>/unlink</b> - ផ្តាច់គណនី

📌 <b>ការជូនដំណឹង</b>
• Portfolio published - នៅពេលអ្នកបោះពុម្ពផ្សាយ portfolio
• Contact received - នៅពេលមានទំនាក់ទំនង
• PDF generated - នៅពេលបង្កើត PDF
• Weekly digest - សេចក្តីសង្ខេបប្រចាំសប្តាហ៍

🔔 ប្រើ <b>/settings</b> ដើម្បីកំណត់ការជូនដំណឹង
      `;
    }

    return `
<b>🤖 Telegram Bot Help</b>

<b>/start</b> - Start using the bot
<b>/help</b> - Show this help message
<b>/status</b> - Check your status
<b>/settings</b> - Configure notifications
<b>/unlink</b> - Unlink your account

📌 <b>Notifications</b>
• Portfolio published - When you publish a portfolio
• Contact received - When someone contacts you
• PDF generated - When you generate a PDF
• Weekly digest - Weekly summary of your portfolio

🔔 Use <b>/settings</b> to configure notifications
    `;
  }

  /**
   * Format status message
   */
  static getStatusMessage(user: any, language: 'en' | 'km'): string {
    if (language === 'km') {
      return `
<b>📊 ស្ថានភាពគណនី</b>

🔗 <b>ស្ថានភាព</b>: ${user.isLinked ? '✅ ភ្ជាប់រួច' : '❌ មិនទាន់ភ្ជាប់'}
🔔 <b>ការជូនដំណឹង</b>: ${user.settings.notificationsEnabled ? '✅ បើក' : '❌ បិទ'}
🌐 <b>ភាសា</b>: ${user.settings.language === 'km' ? 'ខ្មែរ' : 'English'}
🕐 <b>សកម្មភាពចុងក្រោយ</b>: ${new Date(user.lastActiveAt).toLocaleString('km-KH')}

<b>📋 ការជូនដំណឹង</b>
• Portfolio published: ${user.settings.notificationTypes.portfolioPublished ? '✅' : '❌'}
• Contact received: ${user.settings.notificationTypes.contactReceived ? '✅' : '❌'}
• PDF generated: ${user.settings.notificationTypes.pdfGenerated ? '✅' : '❌'}
• Weekly digest: ${user.settings.notificationTypes.weeklyDigest ? '✅' : '❌'}
• System alerts: ${user.settings.notificationTypes.systemAlert ? '✅' : '❌'}
      `;
    }

    return `
<b>📊 Account Status</b>

🔗 <b>Status</b>: ${user.isLinked ? '✅ Linked' : '❌ Not linked'}
🔔 <b>Notifications</b>: ${user.settings.notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}
🌐 <b>Language</b>: ${user.settings.language === 'km' ? 'ខ្មែរ' : 'English'}
🕐 <b>Last Active</b>: ${new Date(user.lastActiveAt).toLocaleString()}

<b>📋 Notification Types</b>
• Portfolio published: ${user.settings.notificationTypes.portfolioPublished ? '✅' : '❌'}
• Contact received: ${user.settings.notificationTypes.contactReceived ? '✅' : '❌'}
• PDF generated: ${user.settings.notificationTypes.pdfGenerated ? '✅' : '❌'}
• Weekly digest: ${user.settings.notificationTypes.weeklyDigest ? '✅' : '❌'}
• System alerts: ${user.settings.notificationTypes.systemAlert ? '✅' : '❌'}
    `;
  }

  /**
   * Format settings message
   */
  static getSettingsMessage(language: 'en' | 'km'): string {
    if (language === 'km') {
      return `
<b>⚙️ កំណត់ការជូនដំណឹង</b>

សូមជ្រើសរើសការកំណត់ដែលអ្នកចង់ផ្លាស់ប្តូរ:

1. <b>បើក/បិទការជូនដំណឹង</b>
2. <b>ផ្លាស់ប្តូរភាសា</b>
3. <b>គ្រប់គ្រងប្រភេទការជូនដំណឹង</b>

ឧទាហរណ៍:
• /notifications on - បើកការជូនដំណឹង
• /notifications off - បិទការជូនដំណឹង
• /language en - ប្តូរទៅភាសាអង់គ្លេស
• /language km - ប្តូរទៅភាសាខ្មែរ
      `;
    }

    return `
<b>⚙️ Notification Settings</b>

Select the setting you want to change:

1. <b>Toggle notifications</b>
2. <b>Change language</b>
3. <b>Manage notification types</b>

Examples:
• /notifications on - Enable notifications
• /notifications off - Disable notifications
• /language en - Switch to English
• /language km - Switch to Khmer
    `;
  }

  /**
   * Format notification message
   */
  static formatNotification(type: string, data: any, language: 'en' | 'km'): string {
    switch (type) {
      case 'portfolio_published':
        if (language === 'km') {
          return `
<b>📢 Portfolio ត្រូវបានបោះពុម្ពផ្សាយ!</b>

ឈ្មោះ: <b>${data.title}</b>
Link: ${data.url || 'N/A'}

👀 ចែករំលែក portfolio របស់អ្នកជាមួយពិភពលោក!
          `;
        }
        return `
<b>📢 Portfolio Published!</b>

Title: <b>${data.title}</b>
Link: ${data.url || 'N/A'}

👀 Share your portfolio with the world!
        `;

      case 'contact_received':
        if (language === 'km') {
          return `
<b>💬 ទំនាក់ទំនងថ្មី!</b>

ឈ្មោះ: <b>${data.name || 'N/A'}</b>
សារ: ${data.message || 'N/A'}

📧 ឆ្លើយតបទៅកាន់: ${data.email || 'N/A'}
          `;
        }
        return `
<b>💬 New Contact!</b>

Name: <b>${data.name || 'N/A'}</b>
Message: ${data.message || 'N/A'}

📧 Reply to: ${data.email || 'N/A'}
        `;

      case 'pdf_generated':
        if (language === 'km') {
          return `
<b>📄 PDF ត្រូវបានបង្កើត!</b>

Portfolio: <b>${data.portfolioTitle || 'N/A'}</b>
ទំហំ: ${data.fileSize ? `${(data.fileSize / 1024).toFixed(2)} KB` : 'N/A'}

📥 ទាញយក: ${data.downloadUrl || 'N/A'}
          `;
        }
        return `
<b>📄 PDF Generated!</b>

Portfolio: <b>${data.portfolioTitle || 'N/A'}</b>
Size: ${data.fileSize ? `${(data.fileSize / 1024).toFixed(2)} KB` : 'N/A'}

📥 Download: ${data.downloadUrl || 'N/A'}
        `;

      case 'weekly_digest':
        if (language === 'km') {
          return `
<b>📊 សេចក្តីសង្ខេបប្រចាំសប្តាហ៍</b>

សួស្តី <b>${data.name}</b>! នេះជាស្ថិតិរបស់អ្នក:

👁️ <b>ទស្សនា</b>: ${data.views || 0}
📄 <b>ទាញយក PDF</b>: ${data.downloads || 0}
💬 <b>ទំនាក់ទំនង</b>: ${data.contacts || 0}
📈 <b>ពិន្ទុ</b>: ${data.score || 'N/A'}

បន្តធ្វើការងារល្អ! 💪
          `;
        }
        return `
<b>📊 Weekly Digest</b>

Hello <b>${data.name}</b>! Here are your stats:

👁️ <b>Views</b>: ${data.views || 0}
📄 <b>PDF Downloads</b>: ${data.downloads || 0}
💬 <b>Contacts</b>: ${data.contacts || 0}
📈 <b>Score</b>: ${data.score || 'N/A'}

Keep up the good work! 💪
        `;

      default:
        return `📢 ${data.message || 'Notification'}`;
    }
  }
}