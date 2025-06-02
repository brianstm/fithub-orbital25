import request from 'supertest';
import app from '../app';
import { createTestUser, createTestGym, createTestBooking, generateToken } from '../test/helpers';
import { IUser } from '../models/User';
import { IGym } from '../models/Gym';
import { IBooking } from '../models/Booking';
import mongoose from 'mongoose';

describe('Booking Routes', () => {
  describe('POST /api/bookings', () => {
    let token: string;
    let gymId: string;
    let user: mongoose.Document & IUser;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      const gym = await createTestGym();
      gymId = (gym._id as mongoose.Types.ObjectId).toString();
    });

    it('should create a booking when authenticated', async () => {
      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', token)
        .send({
          gym: gymId,
          date: '2024-03-25',
          startTime: '10:00',
          endTime: '11:00',
          user: (user._id as mongoose.Types.ObjectId).toString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'pending');
      expect(response.body.data).toHaveProperty(
        'user',
        (user._id as mongoose.Types.ObjectId).toString()
      );
      expect(response.body.data).toHaveProperty('gym', gymId);
    });

    it('should not create booking without authentication', async () => {
      const response = await request(app).post('/api/bookings').send({
        gym: gymId,
        date: '2024-03-25',
        startTime: '10:00',
        endTime: '11:00',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate booking data', async () => {
      const response = await request(app).post('/api/bookings').set('Authorization', token).send({
        gym: gymId,
        date: 'invalid-date',
        startTime: 'invalid-time',
        endTime: '11:00',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/bookings', () => {
    let token: string;
    let user: mongoose.Document & IUser;
    let gym: mongoose.Document & IGym;

    beforeEach(async () => {
      user = await createTestUser();
      token = `Bearer ${generateToken(user)}`;
      gym = await createTestGym();
      await createTestBooking(
        user._id as mongoose.Types.ObjectId,
        gym._id as mongoose.Types.ObjectId
      );
    });

    it('should get user bookings when authenticated', async () => {
      const response = await request(app).get('/api/bookings').set('Authorization', token);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (typeof response.body.data[0].user === 'object') {
        expect(response.body.data[0].user._id).toBe((user._id as mongoose.Types.ObjectId).toString());
      } else {
        expect(response.body.data[0].user).toBe((user._id as mongoose.Types.ObjectId).toString());
      }
    });

    it('should not get bookings without authentication', async () => {
      const response = await request(app).get('/api/bookings');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/bookings/:id/status', () => {
    let adminToken: string;
    let bookingId: string;
    let user: mongoose.Document & IUser;
    let gym: mongoose.Document & IGym;

    beforeEach(async () => {
      const admin = await createTestUser('admin');
      adminToken = `Bearer ${generateToken(admin)}`;
      user = await createTestUser();
      gym = await createTestGym();
      const booking = await createTestBooking(
        user._id as mongoose.Types.ObjectId,
        gym._id as mongoose.Types.ObjectId
      );
      bookingId = (booking._id as mongoose.Types.ObjectId).toString();
    });

    it('should update booking status when admin', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'confirmed',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status', 'confirmed');
    });

    it('should not update booking status without admin privileges', async () => {
      const userToken = `Bearer ${generateToken(user)}`;
      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Authorization', userToken)
        .send({
          status: 'confirmed',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should validate status value', async () => {
      const response = await request(app)
        .patch(`/api/bookings/${bookingId}/status`)
        .set('Authorization', adminToken)
        .send({
          status: 'invalid-status',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
