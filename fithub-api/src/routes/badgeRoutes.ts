import express from 'express';
import {
  getUserBadges,
  checkUserBadges,
  getLeaderboards,
  getUserStats,
  getBadgeDefinitions,
} from '../controllers/badgeController';
import { protect } from '../middlewares/auth';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Badge:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Badge name
 *         description:
 *           type: string
 *           description: Badge description
 *         icon:
 *           type: string
 *           description: Badge icon/emoji
 *         category:
 *           type: string
 *           enum: [consistency, strength, milestone, achievement]
 *           description: Badge category
 *         earnedAt:
 *           type: string
 *           format: date-time
 *           description: When the badge was earned
 *         criteria:
 *           type: object
 *           description: Criteria that was met to earn this badge
 *     UserStats:
 *       type: object
 *       properties:
 *         totalWorkouts:
 *           type: integer
 *           description: Total number of workouts completed
 *         totalVolumeLiftedKg:
 *           type: number
 *           description: Total weight lifted in kilograms
 *         currentStreak:
 *           type: integer
 *           description: Current workout streak in days
 *         longestStreak:
 *           type: integer
 *           description: Longest workout streak achieved
 *         lastWorkoutDate:
 *           type: string
 *           format: date-time
 *           description: Date of last workout
 *         totalWorkoutDuration:
 *           type: integer
 *           description: Total workout duration in minutes
 *         personalRecords:
 *           type: object
 *           description: Personal records for each exercise
 */

/**
 * @swagger
 * /api/badges/my-badges:
 *   get:
 *     summary: Get user's earned badges
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's badges and stats
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
 *                     badges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *                     stats:
 *                       $ref: '#/components/schemas/UserStats'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/my-badges', protect, getUserBadges);

/**
 * @swagger
 * /api/badges/check:
 *   post:
 *     summary: Check and award new badges to user
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge check result
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
 *                     newBadges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *                     message:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/check', protect, checkUserBadges);

/**
 * @swagger
 * /api/badges/leaderboards:
 *   get:
 *     summary: Get community leaderboards
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Community leaderboards
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
 *                     leaderboards:
 *                       type: object
 *                       properties:
 *                         weeklyStreaks:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rank:
 *                                 type: integer
 *                               user:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                                   profilePicture:
 *                                     type: string
 *                               streak:
 *                                 type: integer
 *                               badges:
 *                                 type: integer
 *                         totalVolume:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rank:
 *                                 type: integer
 *                               user:
 *                                 type: object
 *                               volume:
 *                                 type: number
 *                               badges:
 *                                 type: integer
 *                         totalWorkouts:
 *                           type: array
 *                           items:
 *                             type: object
 *                         consistency:
 *                           type: array
 *                           items:
 *                             type: object
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/leaderboards', protect, getLeaderboards);

/**
 * @swagger
 * /api/badges/my-stats:
 *   get:
 *     summary: Get user's fitness statistics
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's fitness statistics
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
 *                     stats:
 *                       $ref: '#/components/schemas/UserStats'
 *                     badgeCount:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/my-stats', protect, getUserStats);

/**
 * @swagger
 * /api/badges/definitions:
 *   get:
 *     summary: Get all available badge definitions
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available badge definitions
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
 *                     badges:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           category:
 *                             type: string
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/definitions', protect, getBadgeDefinitions);

export default router; 