import request from 'supertest';
import app from '../app';
import { createTestUser, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

describe('User Routes', () => {
  let token: string;
  let user: mongoose.Document & IUser;

  beforeEach(async () => {
    user = await createTestUser();
    token = `Bearer ${generateToken(user)}`;
  });

  describe('GET /api/users', () => {
    it('should get all non-admin users', async () => {
      const response = await request(app).get('/api/users').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.every((u: IUser) => u.role !== 'admin')).toBe(true);
    });

    it('should not get users without authentication', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get(`/api/users/${(user._id as mongoose.Types.ObjectId).toString()}`)
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty(
        '_id',
        (user._id as mongoose.Types.ObjectId).toString()
      );
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get(`/api/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', token);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put(`/api/users/${user._id}`)
        .set('Authorization', token)
        .send({
          name: 'Updated Name',
          bio: 'Updated bio',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Updated Name');
      expect(response.body.data).toHaveProperty('bio', 'Updated bio');
    });

    it('should not update user without authentication', async () => {
      const response = await request(app).put(`/api/users/${user._id}`).send({
        name: 'Updated Name',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete(`/api/users/${(user._id as mongoose.Types.ObjectId).toString()}`)
        .set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Create a new admin user for verification
      const adminUser = await createTestUser('admin');
      const adminToken = `Bearer ${generateToken(adminUser)}`;

      // Verify user is deleted
      const getResponse = await request(app)
        .get(`/api/users/${(user._id as mongoose.Types.ObjectId).toString()}`)
        .set('Authorization', adminToken);

      expect(getResponse.status).toBe(404);
    });

    it('should not delete user without authentication', async () => {
      const response = await request(app).delete(
        `/api/users/${(user._id as mongoose.Types.ObjectId).toString()}`
      );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
