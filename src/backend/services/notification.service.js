import prisma from '../config/database.js';
import { emitToUser } from '../sockets/index.js';

export class NotificationService {
  /**
   * Create an in-app notification and emit live Socket.IO event
   */
  static async createNotification(userId, title, message, type = 'SYSTEM', link = null) {
    if (!userId) return null;

    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          link,
          isRead: false,
        },
      });

      // Real-time broadcast to user room if connected
      emitToUser(userId, 'notification:new', notification);

      return notification;
    } catch (error) {
      console.error('[NotificationService] Error creating notification:', error.message);
      return null;
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(userId, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get count of unread notifications
   */
  static async getUnreadCount(userId) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(userId, notificationId) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

