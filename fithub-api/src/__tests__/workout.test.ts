import request from 'supertest';
import app from '../app';
import { createTestUser, createTestWorkout, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import { IWorkout } from '../models/Workout';
import mongoose from 'mongoose';

describe('Workout Routes', () => {
  describe('POST /api/workouts', () => {
    let token: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
    });

    it('should create a workout when authenticated', async () => {
      const response = await request(app)
        .post('/api/workouts')
        .set('Authorization', token)
        .send({
          title: 'Test Workout',
          date: new Date().toISOString(),
          user: (user._id as mongoose.Types.ObjectId).toString(),
          exercises: [
            {
              name: 'Push-ups',
              sets: [
                {
                  reps: 10,
                  type: 'normal',
                },
              ],
            },
          ],
          duration: 30,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Test Workout');
      expect(response.body.data).toHaveProperty(
        'user',
        (user._id as mongoose.Types.ObjectId).toString()
      );
    });

    it('should not create workout without authentication', async () => {
      const response = await request(app).post('/api/workouts').send({
        title: 'Test Workout',
        date: new Date().toISOString(),
        exercises: [],
        duration: 30,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate workout data', async () => {
      const response = await request(app).post('/api/workouts').set('Authorization', token).send({
        title: '',
        date: 'invalid-date',
        exercises: 'not-an-array',
        duration: -1,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/workouts', () => {
    let token: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      await createTestWorkout(user._id as mongoose.Types.ObjectId);
    });

    it('should get user workouts when authenticated', async () => {
      const response = await request(app).get('/api/workouts').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty(
        'user',
        (user._id as mongoose.Types.ObjectId).toString()
      );
    });

    it('should not get workouts without authentication', async () => {
      const response = await request(app).get('/api/workouts');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/workouts/:id', () => {
    let token: string;
    let workoutId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const workout = await createTestWorkout(user._id as mongoose.Types.ObjectId);
      workoutId = (workout._id as mongoose.Types.ObjectId).toString();
    });

    it('should get workout by ID when authenticated', async () => {
      const response = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id', workoutId);
    });

    it('should not get workout without authentication', async () => {
      const response = await request(app).get(`/api/workouts/${workoutId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/workouts/${fakeId}`)
        .set('Authorization', token);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    let token: string;
    let workoutId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const workout = await createTestWorkout(user._id as mongoose.Types.ObjectId);
      workoutId = (workout._id as mongoose.Types.ObjectId).toString();
    });

    it('should update workout when authenticated', async () => {
      const response = await request(app)
        .put(`/api/workouts/${workoutId}`)
        .set('Authorization', token)
        .send({
          title: 'Updated Workout',
          duration: 45,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'Updated Workout');
      expect(response.body.data).toHaveProperty('duration', 45);
    });

    it('should not update workout without authentication', async () => {
      const response = await request(app).put(`/api/workouts/${workoutId}`).send({
        title: 'Updated Workout',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not update non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/workouts/${fakeId}`)
        .set('Authorization', token)
        .send({
          title: 'Updated Workout',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    let token: string;
    let workoutId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const workout = await createTestWorkout(user._id as mongoose.Types.ObjectId);
      workoutId = (workout._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete workout when authenticated', async () => {
      const response = await request(app)
        .delete(`/api/workouts/${workoutId}`)
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify workout is deleted
      const getResponse = await request(app)
        .get(`/api/workouts/${workoutId}`)
        .set('Authorization', token);
      expect(getResponse.status).toBe(404);
    });

    it('should not delete workout without authentication', async () => {
      const response = await request(app).delete(`/api/workouts/${workoutId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not delete non-existent workout', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/workouts/${fakeId}`)
        .set('Authorization', token);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
