const Invoice = require('../models/Invoice');
const eventDispatcher = require('../events/eventDispatcher');
const { INVOICE_CREATED, INVOICE_STATUS_CHANGED } = require('../events/eventTypes');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { customer, items, date, tax, status } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer and items are required' });
    }

    // Calculate totals on backend as well for security
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        product: item.product, // Assuming item.product is the ID
        name: item.name,
        quantity: item.quantity,
        price: item.price
      };
    });

    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      userId: req.user.id,
      customer,
      items: processedItems,
      date: date || Date.now(),
      status: status || 'Unpaid',
      subtotal,
      tax: taxAmount,
      total
    });

    const createdInvoice = await invoice.save();

    // Emit event: INVOICE_CREATED
    // Payload includes invoice details and user info
    eventDispatcher.dispatch(INVOICE_CREATED, createdInvoice);

    res.status(201).json(createdInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ message: 'Server error while creating invoice' });
  }
};

// @desc    Get all invoices for user
// @route   GET /api/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Server error while fetching invoices' });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email address phone')
      .populate('items.product', 'name price');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Ensure user owns the invoice
    if (invoice.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
// @access  Private
exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Unpaid', 'Paid', 'Overdue', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Ensure user owns the invoice
    if (invoice.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    invoice.status = status;
    const updatedInvoice = await invoice.save();

    // Emit event: INVOICE_STATUS_CHANGED
    eventDispatcher.dispatch(INVOICE_STATUS_CHANGED, updatedInvoice);

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
