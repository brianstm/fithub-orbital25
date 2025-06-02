import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Gym from '../models/Gym';
import Post from '../models/Post';
import Workout from '../models/Workout';
import Booking from '../models/Booking';
import { IUser } from '../models/User';
import { IGym } from '../models/Gym';
import { IPost } from '../models/Post';
import { IWorkout } from '../models/Workout';
import { IBooking } from '../models/Booking';

export const createTestUser = async (role: 'user' | 'admin' = 'user'): Promise<mongoose.Document & IUser> => {
  const user = await User.create({
    name: `Test ${role}`,
    email: `test${role}@example.com`,
    password: 'password123',
    role,
  });
  return user;
};

export const generateToken = (user: mongoose.Document & IUser): string => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'test_secret'
  );
};

export const createTestGym = async (): Promise<mongoose.Document & IGym> => {
  return await Gym.create({
    name: 'Test Gym',
    address: '123 Test St',
    description: 'Test gym description',
    capacity: 50,
    openingHours: {
      weekday: { open: '06:00', close: '22:00' },
      weekend: { open: '08:00', close: '20:00' },
    },
    amenities: ['Parking', 'Showers'],
    images: ['https://example.com/gym.jpg'],
  });
};

export const createTestPost = async (userId: mongoose.Types.ObjectId): Promise<mongoose.Document & IPost> => {
  return await Post.create({
    title: 'Test Post',
    content: 'Test content',
    author: userId,
    category: 'General',
  });
};

export const createTestWorkout = async (userId: mongoose.Types.ObjectId): Promise<mongoose.Document & IWorkout> => {
  return await Workout.create({
    user: userId,
    title: 'Test Workout',
    date: new Date(),
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
};

export const createTestBooking = async (userId: mongoose.Types.ObjectId, gymId: mongoose.Types.ObjectId): Promise<mongoose.Document & IBooking> => {
  return await Booking.create({
    user: userId,
    gym: gymId,
    date: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    status: 'pending',
  });
}; 