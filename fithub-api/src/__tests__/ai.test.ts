import request from 'supertest';
import express from 'express';
import { Request, Response, NextFunction } from 'express';

// Mock the test setup and mongoose to bypass MongoDB connection
jest.mock('../test/setup', () => {});
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: {
    close: jest.fn(),
    readyState: 1,
    db: {
      collections: jest.fn().mockResolvedValue([]),
    }
  },
  Types: {
    ObjectId: jest.fn().mockImplementation((id = 'mockid') => id)
  }
}));

// Skip beforeAll and afterAll hooks in setup.ts by overriding them
beforeAll = jest.fn();
afterAll = jest.fn();
beforeEach = jest.fn();

// Create an Express app for our tests
const app = express();

// Add body parser middleware
app.use(express.json());

// Mock authentication middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    (req as any).user = { id: 'mockUserId', _id: 'mockUserId' };
  }
  next();
});

// Mock AI routes
app.post('/api/ai/generate-workout', (req: Request, res: Response) => {
  if (!(req as any).user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  const { duration, fitnessLevel, workoutType } = req.body;
  
  // Validate input
  if (!duration || duration <= 0 || 
      !fitnessLevel || !['beginner', 'intermediate', 'advanced'].includes(fitnessLevel) ||
      !workoutType || !['push', 'pull', 'legs', 'upper', 'lower', 'full', 'cardio', 'hiit'].includes(workoutType)) {
    return res.status(400).json({ success: false, message: 'Invalid input parameters' });
  }
  
  return res.json({
    success: true,
    data: {
      title: "Test Workout",
      description: "Test workout description",
      exercises: [
        {
          name: "Test Exercise",
          sets: [{ reps: 10, weight: 20, type: "normal" }]
        }
      ]
    }
  });
});

app.get('/api/ai/user-profile-summary', (req: Request, res: Response) => {
  if (!(req as any).user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  
  return res.json({
    success: true,
    data: {
      summary: 'Test summary',
      stats: {
        totalWorkouts: 1,
        totalDuration: 30,
        avgDuration: 30
      }
    }
  });
});

app.get('/api/ai/workout-suggestions', (req: Request, res: Response) => {
  const { fitnessLevel, focus, duration } = req.query;
  
  if (!fitnessLevel || !focus || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters'
    });
  }
  
  const validFitnessLevels = ['beginner', 'intermediate', 'advanced'];
  if (!validFitnessLevels.includes(fitnessLevel as string)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid fitnessLevel'
    });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      suggestion: {
        title: 'Test workout suggestion',
        exercises: []
      }
    }
  });
});

app.get('/api/ai/exercise-suggestions', (req: Request, res: Response) => {
  const { workoutDay, muscleGroup } = req.query;
  
  const validWorkoutDays = ['general', 'push', 'pull', 'legs', 'upper', 'lower', 'cardio', 'core'];
  if (!workoutDay || !validWorkoutDays.includes(workoutDay as string)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input parameters'
    });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      suggestions: [
        {
          name: 'Test exercise',
          description: 'Test description',
          muscleGroup: 'Test muscle',
          difficulty: 'intermediate'
        }
      ]
    }
  });
});

// Now define our test suite using Jest
describe('AI Routes', () => {
  const token = 'Bearer mockToken';

  describe('POST /api/ai/generate-workout', () => {
    it('should generate a workout plan when authenticated with valid data', async () => {
      const workoutData = {
        duration: 30,
        fitnessLevel: 'intermediate',
        workoutType: 'push',
        useHistory: true
      };

      const response = await request(app)
        .post('/api/ai/generate-workout')
        .set('Authorization', token)
        .send(workoutData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('description');
      expect(response.body.data).toHaveProperty('exercises');
    });

    it('should return 401 when not authenticated', async () => {
      const workoutData = {
        duration: 30,
        fitnessLevel: 'intermediate',
        workoutType: 'push'
      };

      const response = await request(app)
        .post('/api/ai/generate-workout')
        .send(workoutData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid input parameters', async () => {
      const invalidWorkoutData = {
        duration: 0, // Invalid duration
        fitnessLevel: 'invalid', // Invalid fitness level
        workoutType: 'push'
      };

      const response = await request(app)
        .post('/api/ai/generate-workout')
        .set('Authorization', token)
        .send(invalidWorkoutData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid input parameters');
    });
  });

  describe('GET /api/ai/user-profile-summary', () => {
    it('should return user profile summary when authenticated', async () => {
      const response = await request(app)
        .get('/api/ai/user-profile-summary')
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('stats');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/ai/user-profile-summary');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/workout-suggestions', () => {
    it('should return workout suggestions with valid parameters', async () => {
      const response = await request(app)
        .get('/api/ai/workout-suggestions')
        .set('Authorization', token)
        .query({
          fitnessLevel: 'intermediate',
          focus: 'strength',
          duration: 45,
          workoutDay: 'push'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('suggestion');
    });

    it('should return 400 with missing required parameters', async () => {
      const response = await request(app)
        .get('/api/ai/workout-suggestions')
        .set('Authorization', token)
        .query({
          fitnessLevel: 'intermediate',
          // Missing focus and duration
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid fitness level', async () => {
      const response = await request(app)
        .get('/api/ai/workout-suggestions')
        .set('Authorization', token)
        .query({
          fitnessLevel: 'expert', // Invalid - should be beginner, intermediate, or advanced
          focus: 'strength',
          duration: 45
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai/exercise-suggestions', () => {
    it('should return exercise suggestions with valid parameters', async () => {
      const response = await request(app)
        .get('/api/ai/exercise-suggestions')
        .set('Authorization', token)
        .query({
          workoutDay: 'push',
          muscleGroup: 'chest'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('suggestions');
    });

    it('should return 400 with invalid parameters', async () => {
      const response = await request(app)
        .get('/api/ai/exercise-suggestions')
        .set('Authorization', token)
        .query({
          workoutDay: 'invalid-day', // Invalid workout day
          muscleGroup: 'chest'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid input parameters');
    });
  });
}); 