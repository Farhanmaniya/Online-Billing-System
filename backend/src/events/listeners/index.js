const eventDispatcher = require('../eventDispatcher');
const { INVOICE_CREATED, INVOICE_STATUS_CHANGED } = require('../eventTypes');
const handleInvoiceCreated = require('./invoiceCreatedListener');
const handleInvoiceStatusChanged = require('./invoiceStatusChangedListener');

const registerListeners = () => {
  eventDispatcher.on(INVOICE_CREATED, handleInvoiceCreated);
  eventDispatcher.on(INVOICE_STATUS_CHANGED, handleInvoiceStatusChanged);
  
  console.log('[Event System] All listeners registered successfully.');
};

module.exports = registerListeners;
