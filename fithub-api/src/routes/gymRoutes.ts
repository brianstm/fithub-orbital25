import express from "express";
import { check } from "../utils/validator";
import {
  getGyms,
  getGym,
  createGym,
  updateGym,
  deleteGym,
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

export default router;
