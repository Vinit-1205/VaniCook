import { NotificationService } from '../services/notification.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
      const notifications = await NotificationService.getUserNotifications(req.user.id, limit);
      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      return ApiResponse.success(res, 'Notifications retrieved', {
        notifications,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      await NotificationService.markAsRead(req.user.id, req.params.id);
      return ApiResponse.success(res, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

