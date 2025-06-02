import request from 'supertest';
import app from '../app';
import { createTestUser, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('name', 'Test User');
    });

    it('should not register with invalid data', async () => {
      const response = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'invalid-email',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'testuser@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    let token: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app).get('/api/auth/profile').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Test user');
    });

    it('should not get profile without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
