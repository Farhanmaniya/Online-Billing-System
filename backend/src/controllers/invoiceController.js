const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const eventDispatcher = require('../events/eventDispatcher');
const { INVOICE_CREATED, INVOICE_STATUS_CHANGED, PRODUCT_LOW_STOCK } = require('../events/eventTypes');

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { customer, items, date, tax, status, dueDate, paymentTerms, isRecurring, frequency, currency, taxType } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({ message: 'Customer and items are required' });
    }

    // Calculate totals on backend as well for security
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return {
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      };
    });

    // Check stock availability before saving
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product "${item.name}" not found` });
      }
      // If product exists but doesn't have stock management fields yet, it might be undefined/NaN
      const currentStock = product.stockQuantity ?? 999999;
      if (currentStock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.name}". In stock: ${currentStock}, Requested: ${item.quantity}. Please update stock in Products.`
        });
      }
    }

    const taxAmount = tax || 0;
    const total = subtotal + taxAmount;

    const invoice = new Invoice({
      userId: req.user.id,
      customer,
      items: processedItems,
      date: date || Date.now(),
      dueDate,
      paymentTerms,
      status: status || 'Unpaid',
      isRecurring: isRecurring || false,
      frequency: frequency || 'monthly',
      currency: currency || 'INR',
      taxType: taxType || 'Standard',
      subtotal,
      tax: taxAmount,
      total
    });

    const createdInvoice = await invoice.save();

    // Deduct stock after successful invoice save
    for (const item of processedItems) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
      // Fire low stock event if threshold crossed
      if (product && product.stockQuantity <= product.lowStockThreshold) {
        eventDispatcher.dispatch(PRODUCT_LOW_STOCK, product);
      }
    }

    // Emit event: INVOICE_CREATED
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
    // Auto-update overdue invoices
    await Invoice.updateMany(
      { 
        userId: req.user.id, 
        status: 'Unpaid', 
        dueDate: { $lt: new Date() } 
      },
      { status: 'Overdue' }
    );

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
      .populate('userId', 'name email companyName companyLogo businessAddress phoneNumber taxId')
      .populate('items.product', 'name price');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Ensure user owns the invoice
    // Note: userId is populated, so we check userId._id
    if (invoice.userId._id.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if overdue and update if necessary
    if (invoice.status === 'Unpaid' && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      invoice.status = 'Overdue';
      await invoice.save();
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Public: Get invoice by ID for payment (no auth, limited use)
// @route   GET /api/public/invoices/:id
// @access  Public (for email pay link / demo)
exports.getInvoicePublic = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email address phone')
      .populate('userId', 'name email companyName companyLogo businessAddress phoneNumber taxId')
      .populate('items.product', 'name price');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Reuse the same overdue check so public view reflects current status
    if (invoice.status === 'Unpaid' && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      invoice.status = 'Overdue';
      await invoice.save();
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching public invoice:', error);
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

    let newStatus = status;
    // If setting to Unpaid but date is passed, set to Overdue
    if (newStatus === 'Unpaid' && invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      newStatus = 'Overdue';
    }

    invoice.status = newStatus;
    const updatedInvoice = await invoice.save();

    // Emit event: INVOICE_STATUS_CHANGED
    eventDispatcher.dispatch(INVOICE_STATUS_CHANGED, updatedInvoice);

    res.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Public: Mark invoice as Paid via mock payment
// @route   POST /api/public/invoices/:id/pay
// @access  Public (academic/demo only)
exports.payInvoicePublic = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // For demo we simply mark as Paid if not already
    if (invoice.status !== 'Paid') {
      invoice.status = 'Paid';
      const updatedInvoice = await invoice.save();
      eventDispatcher.dispatch(INVOICE_STATUS_CHANGED, updatedInvoice);
      return res.json(updatedInvoice);
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error processing public payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
