// Central registry of domain event names.
// Using constants avoids typos in string literals and documents which events
// exist in the system so emitters and listeners can coordinate loosely.
module.exports = {
  // Emitted whenever a new invoice is created and persisted.
  INVOICE_CREATED: 'INVOICE_CREATED',
  // Emitted when an existing invoice changes status (e.g., Paid, Overdue).
  INVOICE_STATUS_CHANGED: 'INVOICE_STATUS_CHANGED',
  // Reserved for scenarios where an invoice becomes overdue automatically.
  INVOICE_OVERDUE: 'INVOICE_OVERDUE',
  // Reserved for payment‑related workflows, decoupled from invoices.
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  // Emitted when a product stock falls below its lowStockThreshold.
  PRODUCT_LOW_STOCK: 'PRODUCT_LOW_STOCK',
};
