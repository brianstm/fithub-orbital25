import express from 'express';
import { check } from '../utils/validator';
import { getBookings, getBooking, createBooking, updateBookingStatus, deleteBooking } from '../controllers/bookingController';
import { protect, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { UserRole } from '../models/User';
import { BookingStatus } from '../models/Booking';

const router = express.Router();

// Booking validation
const bookingValidation = [
  check('gym').notEmpty().withMessage('Gym is required'),
  check('date').isISO8601().toDate().withMessage('Valid date is required'),
  check('startTime').notEmpty().withMessage('Start time is required'),
  check('endTime').notEmpty().withMessage('End time is required'),
];

// Status update validation
const statusValidation = [
  check('status')
    .isIn(Object.values(BookingStatus))
    .withMessage('Invalid booking status'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - user
 *         - gym
 *         - date
 *         - startTime
 *         - endTime
 *       properties:
 *         _id:
 *           type: string
 *           description: Booking ID
 *         user:
 *           type: string
 *           description: User ID who made the booking
 *         gym:
 *           type: string
 *           description: Gym ID being booked
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the booking
 *         startTime:
 *           type: string
 *           description: Start time of the booking (format HH:MM)
 *         endTime:
 *           type: string
 *           description: End time of the booking (format HH:MM)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           default: pending
 *           description: Current status of the booking
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the booking was last updated
 */

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Get all bookings for the authenticated user (or all bookings for admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 bookings:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Get a single booking by ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getBooking);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gym
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               gym:
 *                 type: string
 *                 description: ID of the gym
 *                 example: "507f1f77bcf86cd799439011"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the booking
 *                 example: "2024-03-25"
 *               startTime:
 *                 type: string
 *                 description: Start time (format HH:MM)
 *                 example: "10:00"
 *               endTime:
 *                 type: string
 *                 description: End time (format HH:MM)
 *                 example: "11:00"
 *     responses:
 *       201:
 *         description: Created booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error or time slot already booked
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Gym not found
 *       500:
 *         description: Server error
 */
router.post('/', protect, validate(bookingValidation), createBooking);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled, completed]
 *                 description: New booking status
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: Updated booking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/status', protect, validate(statusValidation), updateBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking (admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorize(UserRole.ADMIN), deleteBooking);

export default router; 