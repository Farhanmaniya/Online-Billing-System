const notificationService = require('../../services/notificationService');
const emailService = require('../../services/emailService');

/**
 * Handle INVOICE_STATUS_CHANGED event
 * @param {Object} invoice - The updated invoice payload
 */
const handleInvoiceStatusChanged = async (invoice) => {
  try {
    console.log(`[Listener] Processing INVOICE_STATUS_CHANGED for ${invoice._id}. Status: ${invoice.status}`);

    // 1. Create In-App Notification
    let type = 'info';
    if (invoice.status === 'Paid') type = 'success';
    if (invoice.status === 'Overdue') type = 'warning';
    if (invoice.status === 'Cancelled') type = 'error';

    await notificationService.createNotification(
      invoice.userId,
      type,
      'Invoice Status Updated',
      `Invoice #${invoice.invoiceNumber || invoice._id} is now ${invoice.status}.`,
      'Invoice',
      invoice._id
    );

    // 2. (Optional) Send Email for critical status changes (e.g., Overdue)
    if (invoice.status === 'Overdue') {
        const emailHtml = `<p>Your invoice #${invoice._id} is now OVERDUE. Please pay immediately.</p>`;
        // Again, assume we have email or fetch it
        const recipientEmail = 'customer@example.com'; 
        await emailService.sendMail(recipientEmail, `Invoice Overdue #${invoice._id}`, emailHtml);
    }

  } catch (error) {
    console.error(`[Listener] Error in handleInvoiceStatusChanged:`, error);
  }
};

module.exports = handleInvoiceStatusChanged;
