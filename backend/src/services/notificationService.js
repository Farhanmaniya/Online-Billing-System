const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a new notification
   * @param {string} userId
   * @param {string} type
   * @param {string} title
   * @param {string} message
   * @param {string} entityType
   * @param {string} entityId
   */
  async createNotification(userId, type, title, message, entityType, entityId) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        entityType,
        entityId
      });
      await notification.save();
      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId
   * @param {Object} options - { unreadOnly, limit, page }
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const query = { userId };
      if (options.unreadOnly === 'true') {
        query.isRead = false;
      }

      const limit = parseInt(options.limit) || 20;
      const page = parseInt(options.page) || 1;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[NotificationService] Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    try {
      return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
    } catch (error) {
      console.error('[NotificationService] Error marking all as read:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
