const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');
const invoiceCreatedTemplate = require('../../emails/templates/invoiceCreated');

/**
 * Handle INVOICE_CREATED event
 * @param {Object} invoice - The invoice payload
 */
const handleInvoiceCreated = async (invoice) => {
  try {
    console.log(`[Listener] Processing INVOICE_CREATED for ${invoice._id}`);

    // 1. Create In-App Notification
    await notificationService.createNotification(
      invoice.userId,
      'info', // type
      'New Invoice Created', // title
      `Invoice #${invoice.invoiceNumber || invoice._id} has been created. Total: $${invoice.total.toFixed(2)}`, // message
      'Invoice', // entityType
      invoice._id // entityId
    );

    // 2. Send Email
    // Note: In a real app, we should fetch the user/customer email. 
    // Assuming invoice.customer might be populated, or we use a placeholder if missing in payload.
    // Ideally, the event payload should contain necessary email info or we fetch it here.
    const recipientEmail = invoice.customer?.email || 'customer@example.com'; 
    const emailHtml = invoiceCreatedTemplate(invoice);
    
    await emailService.sendMail(
      recipientEmail,
      `New Invoice #${invoice.invoiceNumber || invoice._id}`,
      emailHtml
    );

  } catch (error) {
    console.error(`[Listener] Error in handleInvoiceCreated:`, error);
  }
};

module.exports = handleInvoiceCreated;
