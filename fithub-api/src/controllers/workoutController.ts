import { Request, Response } from 'express';
import Workout, { SetType } from '../models/Workout';

// Get all workouts (for admins) or user's workouts (for regular users)
export const getWorkouts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const workouts = await Workout.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Workout.countDocuments({ user: req.user._id });

    res.success({
      count: workouts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: workouts,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.error('Server error while fetching workouts', 500);
  }
};

// Get a single workout by ID
export const getWorkout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.error('Workout not found', 404);
    }

    // Check if workout belongs to user or user is admin
    if (workout.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.error('Not authorized to access this workout', 403);
    }

    res.success(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    res.error('Server error while fetching workout', 500);
  }
};

// Create a new workout
export const createWorkout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    // Add user ID to request body
    req.body.user = req.user._id;

    // Validate exercises array
    if (
      !req.body.exercises ||
      !Array.isArray(req.body.exercises) ||
      req.body.exercises.length === 0
    ) {
      return res.error('At least one exercise is required', 400);
    }

    // Validate that each exercise has at least one set
    for (const exercise of req.body.exercises) {
      if (!exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
        return res.error(`Exercise "${exercise.name}" must have at least one set`, 400);
      }

      // Validate all sets in the exercise
      for (const set of exercise.sets) {
        // Check if set type is valid
        if (set.type && !Object.values(SetType).includes(set.type)) {
          return res.error(`Invalid set type "${set.type}" for exercise "${exercise.name}"`, 400);
        }

        // Ensure reps is provided
        if (set.reps === undefined || set.reps === null) {
          return res.error(
            `Reps count is required for all sets in exercise "${exercise.name}"`,
            400
          );
        }

        // Remove _id field from set if present
        if (set._id) {
          delete set._id;
        }
      }
    }

    // Create workout
    const workout = await Workout.create(req.body);

    res.success(workout, 201);
  } catch (error) {
    console.error('Error creating workout:', error);
    res.error('Server error while creating workout', 500);
  }
};

// Update a workout
export const updateWorkout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.error('Workout not found', 404);
    }

    // Check if workout belongs to user or user is admin
    if (workout.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.error('Not authorized to update this workout', 403);
    }

    // Don't allow changing the user
    if (req.body.user && req.body.user !== workout.user.toString() && req.user.role !== 'admin') {
      return res.error('Not authorized to change workout ownership', 403);
    }

    // Validate exercises array if provided
    if (req.body.exercises) {
      if (!Array.isArray(req.body.exercises) || req.body.exercises.length === 0) {
        return res.error('At least one exercise is required', 400);
      }

      // Validate that each exercise has at least one set
      for (const exercise of req.body.exercises) {
        if (!exercise.sets || !Array.isArray(exercise.sets) || exercise.sets.length === 0) {
          return res.error(`Exercise "${exercise.name}" must have at least one set`, 400);
        }

        // Validate all sets in the exercise
        for (const set of exercise.sets) {
          // Check if set type is valid
          if (set.type && !Object.values(SetType).includes(set.type)) {
            return res.error(`Invalid set type "${set.type}" for exercise "${exercise.name}"`, 400);
          }

          // Ensure reps is provided
          if (set.reps === undefined || set.reps === null) {
            return res.error(
              `Reps count is required for all sets in exercise "${exercise.name}"`,
              400
            );
          }

          // Remove _id field from set if present
          if (set._id) {
            delete set._id;
          }
        }
      }
    }

    // Update workout
    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.success(updatedWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    res.error('Server error while updating workout', 500);
  }
};

// Delete a workout
export const deleteWorkout = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.error('Workout not found', 404);
    }

    // Check if workout belongs to user or user is admin
    if (workout.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.error('Not authorized to delete this workout', 403);
    }

    await Workout.findByIdAndDelete(req.params.id);

    res.success({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.error('Server error while deleting workout', 500);
  }
};
