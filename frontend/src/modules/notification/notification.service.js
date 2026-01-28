const Notification = require("./notification.model");

async function createNotification(data) {
  return Notification.create(data);
}

module.exports = {
  createNotification
};
