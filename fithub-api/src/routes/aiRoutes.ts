import express from 'express';
import { check } from '../utils/validator';
import {
  generateWorkoutPlan,
  getUserProfileSummary,
  getWorkoutSuggestions,
  getExerciseSuggestions,
} from '../controllers/aiController';
import { protect } from '../middlewares/auth';

const router = express.Router();

// Route for workout generation
router.post('/generate-workout', protect, generateWorkoutPlan);

// Route for user profile summary
router.get('/user-profile-summary', protect, getUserProfileSummary);

// Route for workout suggestions
router.get('/workout-suggestions', protect, getWorkoutSuggestions);

// Get exercise suggestions
router.get('/exercise-suggestions', protect, getExerciseSuggestions);

export default router;
