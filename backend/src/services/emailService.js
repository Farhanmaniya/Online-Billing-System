const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send an email (Abstracted)
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} htmlContent - HTML content
   */
  async sendMail(to, subject, htmlContent) {
    try {
      console.log(`[EmailService] Attempting to send email to: ${to}`);
      
      const info = await this.transporter.sendMail({
        from: `"Online Billing System" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      });

      console.log(`[EmailService] Email sent successfully! Message ID: ${info.messageId}`);
      console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return info;
    } catch (error) {
      console.error(`[EmailService] Failed to send email to ${to}:`, error);
      // We do not throw the error to prevent crashing the event listener loop
      // or blocking the main thread. We just log it.
      return null;
    }
  }
}

module.exports = new EmailService();
