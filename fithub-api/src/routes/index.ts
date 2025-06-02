// @ts-ignore
import { Router } from 'express';

// Import all route files
// @ts-ignore
import authRoutes from './auth.routes';
// @ts-ignore
import userRoutes from './user.routes';
// @ts-ignore
import workoutRoutes from './workout.routes';
// @ts-ignore
import gymRoutes from './gym.routes';
// @ts-ignore
import bookingRoutes from './booking.routes';
// @ts-ignore
import postRoutes from './post.routes';
// @ts-ignore
import uploadRoutes from './upload.routes';
// @ts-ignore
import aiRoutes from './ai.routes';

// Main router setup
const router = Router();

// Register routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/workouts', workoutRoutes);
router.use('/gyms', gymRoutes);
router.use('/bookings', bookingRoutes);
router.use('/posts', postRoutes);
router.use('/upload', uploadRoutes);
router.use('/ai', aiRoutes);

export default router; 