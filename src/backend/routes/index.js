import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import cookRoutes from './cook.routes.js';
import availabilityRoutes from './availability.routes.js';
import locationRoutes from './location.routes.js';
import bookingRoutes from './booking.routes.js';
import groupRoutes from './group.routes.js';
import pricingRoutes from './pricing.routes.js';
import voiceRoutes from './voice.routes.js';
import notificationRoutes from './notification.routes.js';
import adminRoutes from './admin.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/cooks', cookRoutes);
apiRouter.use('/availability', availabilityRoutes);
apiRouter.use('/locations', locationRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/groups', groupRoutes);
apiRouter.use('/pricing', pricingRoutes);
apiRouter.use('/voice', voiceRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/admin', adminRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'CookConnect API',
    phase: 3,
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
