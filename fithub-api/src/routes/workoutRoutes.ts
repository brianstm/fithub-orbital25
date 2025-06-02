import express from 'express';
import { check } from '../utils/validator';
import {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} from '../controllers/workoutController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Set:
 *       type: object
 *       required:
 *         - reps
 *         - type
 *       properties:
 *         reps:
 *           type: integer
 *           minimum: 0
 *           description: Number of repetitions
 *         weight:
 *           type: number
 *           minimum: 0
 *           description: Weight used in kg
 *         duration:
 *           type: integer
 *           minimum: 0
 *           description: Duration in seconds for timed exercises
 *         distance:
 *           type: number
 *           minimum: 0
 *           description: Distance in meters for cardio exercises
 *         type:
 *           type: string
 *           enum: [normal, warm_up, drop_set, failure]
 *           description: Type of set
 *         notes:
 *           type: string
 *           description: Additional notes for this set
 *     Exercise:
 *       type: object
 *       required:
 *         - name
 *         - sets
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the exercise
 *         sets:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Set'
 *           description: Array of sets for this exercise
 *         notes:
 *           type: string
 *           description: Additional notes for this exercise
 *     Workout:
 *       type: object
 *       required:
 *         - user
 *         - title
 *         - date
 *         - exercises
 *         - duration
 *       properties:
 *         _id:
 *           type: string
 *           description: Workout ID
 *         user:
 *           type: string
 *           description: User ID who owns this workout
 *         title:
 *           type: string
 *           description: Title of the workout
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date when the workout was performed
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Exercise'
 *           description: Array of exercises in this workout
 *         duration:
 *           type: integer
 *           minimum: 1
 *           description: Duration of the workout in minutes
 *         notes:
 *           type: string
 *           description: Additional notes for this workout
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the workout was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the workout was last updated
 */

/**
 * @swagger
 * /api/workouts:
 *   get:
 *     summary: Get all workouts (admin) or user's workouts
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', protect, getWorkouts);

/**
 * @swagger
 * /api/workouts/{id}:
 *   get:
 *     summary: Get a workout by ID
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, getWorkout);

/**
 * @swagger
 * /api/workouts:
 *   post:
 *     summary: Create a new workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - exercises
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the workout
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the workout
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - sets
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the exercise
 *                     notes:
 *                       type: string
 *                       description: Notes about the exercise
 *                     sets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required:
 *                           - type
 *                           - reps
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [regular, warmup, dropset, failure]
 *                             description: Type of set
 *                           reps:
 *                             type: integer
 *                             minimum: 0
 *                             description: Number of repetitions
 *                           weight:
 *                             type: number
 *                             minimum: 0
 *                             description: Weight used (kg)
 *                           duration:
 *                             type: integer
 *                             minimum: 0
 *                             description: Duration in seconds (for timed exercises)
 *                           distance:
 *                             type: number
 *                             minimum: 0
 *                             description: Distance covered (km)
 *                           notes:
 *                             type: string
 *                             description: Notes about the set
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/', protect, createWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 *   put:
 *     summary: Update a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the workout
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the workout
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               exercises:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the exercise
 *                     notes:
 *                       type: string
 *                       description: Notes about the exercise
 *                     sets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [regular, warmup, dropset, failure]
 *                             description: Type of set
 *                           reps:
 *                             type: integer
 *                             minimum: 0
 *                             description: Number of repetitions
 *                           weight:
 *                             type: number
 *                             minimum: 0
 *                             description: Weight used (kg)
 *                           duration:
 *                             type: integer
 *                             minimum: 0
 *                             description: Duration in seconds (for timed exercises)
 *                           distance:
 *                             type: number
 *                             minimum: 0
 *                             description: Distance covered (km)
 *                           notes:
 *                             type: string
 *                             description: Notes about the set
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Workout'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, updateWorkout);

/**
 * @swagger
 * /api/workouts/{id}:
 *   delete:
 *     summary: Delete a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, deleteWorkout);

export default router; 