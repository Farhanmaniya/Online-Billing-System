/**
 * Invoice Created Email Template
 * @param {Object} invoice - The invoice object
 * @returns {string} HTML content
 */
const invoiceCreatedTemplate = (invoice) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="color: #333;">New Invoice Created</h1>
      <p>Dear Customer,</p>
      <p>A new invoice <strong>#${invoice.invoiceNumber || invoice._id}</strong> has been created for you.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Total Amount:</strong> $${invoice.total.toFixed(2)}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${invoice.status}</p>
      </div>
      <p>Please log in to your account to view the full details and make a payment.</p>
      <p>Thank you for your business!</p>
    </div>
  `;
};

module.exports = invoiceCreatedTemplate;
