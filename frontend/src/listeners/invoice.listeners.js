const { INVOICE_CREATED, INVOICE_STATUS_CHANGED } = require("../events/eventTypes");
const { createNotification } = require("../modules/notification/notification.service");
const { sendEmail } = require("../modules/email/email.service");

async function invoiceEventListener(eventType, payload) {
  switch (eventType) {
    case INVOICE_CREATED:
      await createNotification({
        userId: payload.userId,
        type: eventType,
        title: "Invoice Created",
        message: `Invoice ${payload.invoiceNumber} has been created.`,
        entityType: "invoice",
        entityId: payload.invoiceId
      });

      await sendEmail({
        to: payload.customerEmail,
        subject: "New Invoice Created",
        body: `Your invoice ${payload.invoiceNumber} has been generated.`
      });
      break;

    case INVOICE_STATUS_CHANGED:
      await createNotification({
        userId: payload.userId,
        type: eventType,
        title: "Invoice Status Updated",
        message: `Invoice ${payload.invoiceNumber} status changed.`,
        entityType: "invoice",
        entityId: payload.invoiceId
      });
      break;

    default:
      break;
  }
}

module.exports = invoiceEventListener;
