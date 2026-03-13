/**
 * Invoice Created Email Template
 * @param {Object} invoice - The invoice object
 * @returns {string} HTML content
 */
const invoiceCreatedTemplate = (invoice) => {
  const date = new Date(invoice.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate Due Date
  let dueDateStr = '';
  if (invoice.dueDate) {
    dueDateStr = new Date(invoice.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    // Fallback: +30 days
    const dueDateObj = new Date(invoice.date);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    dueDateStr = dueDateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const companyName = invoice.sender && invoice.sender.companyName ? invoice.sender.companyName : 'ONLINE BILLING';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Invoice</title>
  <style>
    /* Reset styles */
    body, table, td, div, p, a {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
      margin: 0;
      padding: 0;
    }
    body {
      width: 100% !important;
      height: 100% !important;
      background-color: #f4f7f6;
    }
    
    /* Responsive grid */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .invoice-header td { display: block; text-align: center !important; }
      .invoice-header td.right { margin-top: 15px; }
    }
  </style>
</head>
<body style="background-color: #f4f7f6; padding: 20px 0;">

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table class="container" role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #2c3e50; padding: 30px 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left">
                    <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 600;">${companyName}</h1>
                  </td>
                  <td align="right">
                    <p style="color: #ecf0f1; font-size: 14px; margin: 0; opacity: 0.8;">INVOICE RECEIPT</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice Info -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="top" width="50%">
                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Billed To</p>
                    <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 5px;">${invoice.customer ? invoice.customer.name : 'Valued Customer'}</h3>
                    <p style="color: #34495e; font-size: 14px; margin: 0;">${invoice.customer ? invoice.customer.email : ''}</p>
                  </td>
                  <td valign="top" width="50%" align="right">
                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Invoice Number</p>
                    <h3 style="color: #2c3e50; font-size: 18px; margin: 0 0 10px;">#${invoice.invoiceNumber || invoice._id}</h3>
                    
                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Date Issued</p>
                    <p style="color: #34495e; font-size: 14px; margin: 0 0 10px;">${date}</p>

                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Due Date</p>
                    <p style="color: #34495e; font-size: 14px; margin: 0 0 10px;">${dueDateStr}</p>
                    
                    ${invoice.paymentTerms ? `
                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Payment Terms</p>
                    <p style="color: #34495e; font-size: 14px; margin: 0 0 10px;">${invoice.paymentTerms}</p>
                    ` : ''}

                    <p style="color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Status</p>
                    <span style="background-color: ${getStatusColor(invoice.status)}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${invoice.status.toUpperCase()}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line Items -->
          <tr>
            <td style="padding: 0 40px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <thead>
                  <tr>
                    <th align="left" style="border-bottom: 2px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Item Description</th>
                    <th align="center" style="border-bottom: 2px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
                    <th align="right" style="border-bottom: 2px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Price</th>
                    <th align="right" style="border-bottom: 2px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${invoice.items.map(item => `
                    <tr>
                      <td style="border-bottom: 1px solid #ecf0f1; padding: 15px 0; color: #2c3e50; font-size: 14px;">
                        <strong>${item.name}</strong>
                      </td>
                      <td align="center" style="border-bottom: 1px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 14px;">
                        ${item.quantity}
                      </td>
                      <td align="right" style="border-bottom: 1px solid #ecf0f1; padding: 15px 0; color: #7f8c8d; font-size: 14px;">
                        $${item.price.toFixed(2)}
                      </td>
                      <td align="right" style="border-bottom: 1px solid #ecf0f1; padding: 15px 0; color: #2c3e50; font-size: 14px; font-weight: bold;">
                        $${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding: 20px 40px 10px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="50%"></td>
                  <td width="50%">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 5px 0; color: #7f8c8d; font-size: 14px;">Subtotal</td>
                        <td align="right" style="padding: 5px 0; color: #2c3e50; font-size: 14px;">$${invoice.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: #7f8c8d; font-size: 14px;">Tax</td>
                        <td align="right" style="padding: 5px 0; color: #2c3e50; font-size: 14px;">$${invoice.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; border-top: 2px solid #2c3e50; color: #2c3e50; font-size: 16px; font-weight: bold;">Total Due</td>
                        <td align="right" style="padding: 10px 0; border-top: 2px solid #2c3e50; color: #2c3e50; font-size: 20px; font-weight: bold;">$${invoice.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Call To Action -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              ${invoice.payUrl ? `
                <a 
                  href="${invoice.payUrl}" 
                  style="
                    display: inline-block;
                    background-color: #27ae60;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 24px;
                    border-radius: 4px;
                    font-size: 14px;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                  "
                >
                  Pay Invoice
                </a>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px 40px; text-align: center;">
              <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">
                Thank you for your business!
              </p>
              <p style="color: #95a5a6; font-size: 12px; margin: 0;">
                If you have any questions about this invoice, please contact support.
              </p>
              <div style="margin-top: 20px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
                <p style="color: #bdc3c7; font-size: 11px;">
                  © ${new Date().getFullYear()} Online Billing System. All rights reserved.
                </p>
              </div>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
};

// Helper to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'Paid': return '#27ae60';
    case 'Unpaid': return '#f39c12';
    case 'Overdue': return '#c0392b';
    case 'Cancelled': return '#7f8c8d';
    default: return '#34495e';
  }
};

module.exports = invoiceCreatedTemplate;
