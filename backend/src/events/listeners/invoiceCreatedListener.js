const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');
const pdfService = require('../../services/pdfService');
const invoiceCreatedTemplate = require('../../emails/templates/invoiceCreated');
const Customer = require('../../models/Customer');

const User = require('../../models/User');

/**
 * Handle INVOICE_CREATED event
 * @param {Object} invoice - The invoice payload
 */
const handleInvoiceCreated = async (invoice) => {
  try {
    console.log(`[Listener] Processing INVOICE_CREATED for ${invoice._id}`);

    // 1. Fetch Customer Email & User Details
    let recipientEmail = 'customer@example.com';
    let customerName = 'Customer';
    let replyToEmail = null;
    let senderName = 'Online Billing System';
    
    // Fetch User (Sender) Details
    if (invoice.userId) {
        try {
            const user = await User.findById(invoice.userId);
            if (user) {
                senderName = user.name || 'Online Billing System';
                replyToEmail = user.email;
                invoice.sender = user;
            }
        } catch (err) {
            console.error('[Listener] Error fetching user:', err);
        }
    }

    if (invoice.customer) {
        try {
            const customer = await Customer.findById(invoice.customer);
            if (customer) {
                if (customer.email) {
                    recipientEmail = customer.email;
                }
                customerName = customer.name;
                // Attach customer object to invoice for template
                invoice.customer = customer;
            }
        } catch (err) {
            console.error('[Listener] Error fetching customer:', err);
        }
    }

    const frontendBaseUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    invoice.payUrl = `${frontendBaseUrl}/pay/${invoice._id}`;

    // 2. Generate PDF and Send Email
    const emailHtml = invoiceCreatedTemplate(invoice);
    
    // Generate PDF
    let pdfPath = null;
    try {
        const result = await pdfService.generateInvoicePdf(emailHtml, invoice._id);
        pdfPath = result.filePath;
    } catch (pdfErr) {
        console.error('[Listener] PDF generation failed:', pdfErr);
        // Continue without PDF
    }

    let emailSuccess = false;
    const attachments = pdfPath ? [{ filename: `Invoice-${invoice.invoiceNumber || invoice._id}.pdf`, path: pdfPath }] : [];

    try {
        const emailResult = await emailService.sendMail(
            recipientEmail,
            `New Invoice #${invoice.invoiceNumber || invoice._id}`,
            emailHtml,
            replyToEmail, // replyTo
            `${senderName} (via System)`, // fromName
            attachments
        );
        if (emailResult) {
            emailSuccess = true;
        }
    } catch (emailErr) {
        console.error('[Listener] Email sending failed:', emailErr);
    }
    
    // Cleanup PDF
    if (pdfPath) {
        pdfService.deleteFile(pdfPath);
    }

    // 3. Create In-App Notification with Confirmation
    // Notification Removed as per user request
    /*
    const notificationMessage = emailSuccess
        ? `Invoice #${invoice.invoiceNumber || invoice._id} created. Email sent to ${recipientEmail}.`
        : `Invoice #${invoice.invoiceNumber || invoice._id} created. Email delivery failed to ${recipientEmail}.`;

    await notificationService.createNotification(
      invoice.userId,
      emailSuccess ? 'success' : 'warning', // type
      'Invoice Created', // title
      notificationMessage, // message
      'Invoice', // entityType
      invoice._id // entityId
    );

    console.log(`[Listener] Notification created: ${notificationMessage}`);
    */
    console.log(`[Listener] Email processed for Invoice ${invoice._id}. Notification skipped.`);

  } catch (error) {
    console.error(`[Listener] Error in handleInvoiceCreated:`, error);
  }
};

module.exports = handleInvoiceCreated;
