import express from "express";
import { check } from "../utils/validator";
import {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
  getGymPeakHours,
  getGymAvailability,
} from "../controllers/gymController";
import { protect, admin } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import { UserRole } from "../models/User";

const router = express.Router();

// Gym validation
const gymValidation = [
  check("name").notEmpty().withMessage("Name is required"),
  check("address").notEmpty().withMessage("Address is required"),
  check("openingHours").notEmpty().withMessage("Opening hours are required"),
  check("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be a positive integer"),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Gym:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - description
 *         - capacity
 *         - openingHours
 *       properties:
 *         _id:
 *           type: string
 *           description: Gym ID
 *         name:
 *           type: string
 *           description: Name of the gym
 *         address:
 *           type: string
 *           description: Address of the gym
 *         description:
 *           type: string
 *           description: Description of the gym
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           description: Maximum capacity of the gym
 *         openingHours:
 *           type: object
 *           required:
 *             - weekday
 *             - weekend
 *           properties:
 *             weekday:
 *               type: object
 *               required:
 *                 - open
 *                 - close
 *               properties:
 *                 open:
 *                   type: string
 *                   description: Opening time (format HH:MM)
 *                 close:
 *                   type: string
 *                   description: Closing time (format HH:MM)
 *             weekend:
 *               type: object
 *               required:
 *                 - open
 *                 - close
 *               properties:
 *                 open:
 *                   type: string
 *                   description: Opening time (format HH:MM)
 *                 close:
 *                   type: string
 *                   description: Closing time (format HH:MM)
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           description: List of amenities available
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: URLs to gym images
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the gym was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the gym was last updated
 */

/**
 * @swagger
 * /api/gyms:
 *   get:
 *     summary: Get all gyms
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all gyms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 gyms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Gym'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get("/", protect, getGyms);

/**
 * @swagger
 * /api/gyms/{id}:
 *   get:
 *     summary: Get a gym by ID
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gym details
 *       404:
 *         description: Gym not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id", protect, getGym);

/**
 * @swagger
 * /api/gyms:
 *   post:
 *     summary: Create a new gym (admin only)
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gym'
 *     responses:
 *       201:
 *         description: Gym created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post("/", protect, admin, validate(gymValidation), createGym);

/**
 * @swagger
 * /api/gyms/{id}:
 *   put:
 *     summary: Update a gym (admin only)
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Gym'
 *     responses:
 *       200:
 *         description: Gym updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Gym not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.put("/:id", protect, admin, updateGym);

/**
 * @swagger
 * /api/gyms/{id}:
 *   delete:
 *     summary: Delete a gym (admin only)
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gym deleted successfully
 *       404:
 *         description: Gym not found
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.delete("/:id", protect, admin, deleteGym);

/**
 * @swagger
 * /api/gyms/{id}/peak-hours:
 *   get:
 *     summary: Get gym peak hours analysis
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *     responses:
 *       200:
 *         description: Peak hours analysis data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     gym:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         capacity:
 *                           type: integer
 *                     peakHours:
 *                       type: object
 *                       description: Peak and off-peak hours by day of week
 *                     hourlyData:
 *                       type: object
 *                       description: Raw hourly booking data
 *                     overallHourlyBusyness:
 *                       type: object
 *                       description: Average busyness by hour
 *                     recommendations:
 *                       type: array
 *                       description: Personalized recommendations
 *       404:
 *         description: Gym not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id/peak-hours", protect, getGymPeakHours);

/**
 * @swagger
 * /api/gyms/{id}/availability:
 *   get:
 *     summary: Get gym availability for a specific date
 *     tags: [Gyms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Gym ID
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *     responses:
 *       200:
 *         description: Gym availability data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     gym:
 *                       type: object
 *                     date:
 *                       type: string
 *                     dayOfWeek:
 *                       type: string
 *                     hourlyAvailability:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: integer
 *                           timeSlot:
 *                             type: string
 *                           availableSlots:
 *                             type: integer
 *                           occupancy:
 *                             type: integer
 *                           occupancyRate:
 *                             type: integer
 *                           busyLevel:
 *                             type: string
 *                             enum: [low, medium, high]
 *                           isPeakHour:
 *                             type: boolean
 *                           isOffPeakHour:
 *                             type: boolean
 *                           recommended:
 *                             type: boolean
 *                     summary:
 *                       type: object
 *       400:
 *         description: Missing date parameter
 *       404:
 *         description: Gym not found
 *       401:
 *         description: Not authenticated
 */
router.get("/:id/availability", protect, getGymAvailability);

export default router;
