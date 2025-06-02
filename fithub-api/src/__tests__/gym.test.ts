import request from 'supertest';
import app from '../app';
import { createTestUser, createTestGym, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import { IGym } from '../models/Gym';
import mongoose from 'mongoose';

describe('Gym Routes', () => {
  describe('GET /api/gyms', () => {
    let token: string;

    beforeEach(async () => {
      const user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      await createTestGym();
    });

    it('should get all gyms when authenticated', async () => {
      const response = await request(app).get('/api/gyms').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data[0]).toHaveProperty('name', 'Test Gym');
    });

    it('should not get gyms without authentication', async () => {
      const response = await request(app).get('/api/gyms');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/gyms', () => {
    let adminToken: string;
    let userToken: string;

    beforeEach(async () => {
      const admin = await createTestUser('admin');
      const user = await createTestUser('user');
      adminToken = `Bearer ${generateToken(admin)}`;
      userToken = `Bearer ${generateToken(user)}`;
    });

    it('should create a gym when admin is authenticated', async () => {
      const response = await request(app)
        .post('/api/gyms')
        .set('Authorization', adminToken)
        .send({
          name: 'New Gym',
          address: '456 New St',
          description: 'New gym description',
          capacity: 75,
          openingHours: {
            weekday: { open: '07:00', close: '23:00' },
            weekend: { open: '09:00', close: '21:00' },
          },
          amenities: ['WiFi', 'Lockers'],
          images: ['https://example.com/new-gym.jpg'],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'New Gym');
    });

    it('should not create gym without admin privileges', async () => {
      const response = await request(app).post('/api/gyms').set('Authorization', userToken).send({
        name: 'New Gym',
        address: '456 New St',
        capacity: 75,
      });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/gyms/:id', () => {
    let adminToken: string;
    let gymId: string;

    beforeEach(async () => {
      const admin = await createTestUser('admin');
      adminToken = `Bearer ${generateToken(admin)}`;
      const gym = await createTestGym();
      gymId = (gym._id as mongoose.Types.ObjectId).toString();
    });

    it('should update a gym when admin is authenticated', async () => {
      const response = await request(app)
        .put(`/api/gyms/${gymId}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Updated Gym',
          capacity: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Updated Gym');
      expect(response.body.data).toHaveProperty('capacity', 100);
    });

    it('should not update non-existent gym', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/gyms/${fakeId}`)
        .set('Authorization', adminToken)
        .send({
          name: 'Updated Gym',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/gyms/:id', () => {
    let adminToken: string;
    let gymId: string;

    beforeEach(async () => {
      const admin = await createTestUser('admin');
      adminToken = `Bearer ${generateToken(admin)}`;
      const gym = await createTestGym();
      gymId = (gym._id as mongoose.Types.ObjectId).toString();
    });

    it('should delete a gym when admin is authenticated', async () => {
      const response = await request(app)
        .delete(`/api/gyms/${gymId}`)
        .set('Authorization', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify gym is deleted
      const getResponse = await request(app)
        .get(`/api/gyms/${gymId}`)
        .set('Authorization', adminToken);
      expect(getResponse.status).toBe(404);
    });

    it('should not delete non-existent gym', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .delete(`/api/gyms/${fakeId}`)
        .set('Authorization', adminToken);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
