const express = require('express');
const router = express.Router();
const { getInvoicePublic, payInvoicePublic } = require('../controllers/invoiceController');

router.get('/:id', getInvoicePublic);
router.post('/:id/pay', payInvoicePublic);

module.exports = router;

