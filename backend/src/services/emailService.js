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
   * @param {string} [replyTo] - Optional Reply-To address
   * @param {string} [fromName] - Optional Display Name for the sender
   */
  async sendMail(to, subject, htmlContent, replyTo = null, fromName = "Online Billing System") {
    try {
      console.log(`[EmailService] Attempting to send email to: ${to}`);
      
      const mailOptions = {
        from: `"${fromName}" <${process.env.SMTP_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent,
      };

      if (replyTo) {
        mailOptions.replyTo = replyTo;
      }

      const info = await this.transporter.sendMail(mailOptions);

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
