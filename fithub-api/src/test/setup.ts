/// <reference types="jest" />
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env.test file
dotenv.config();

// Connect to MongoDB before tests start
beforeAll(async () => {
  jest.setTimeout(30000); // Increase timeout for slow DB operations
  try {
    // Disable strictQuery to avoid deprecation warnings
    mongoose.set('strictQuery', false);

    // Mock the success and error methods for response objects
    jest.mock('../middlewares/responseHandler', () => ({
      responseHandler: (req: any, res: any, next: any) => {
        res.success = function(data: any = {}, statusCode: number = 200) {
          return res.status(statusCode).json({
            success: true,
            ...data
          });
        };
        
        res.error = function(message: string = 'An error occurred', statusCode: number = 400) {
          return res.status(statusCode).json({
            success: false,
            message
          });
        };
        
        next();
      }
    }));

    // Only connect if we're not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || '');
      console.log('Connected to test database');
    }
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
});

// Disconnect after all tests are done
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error);
    throw error;
  }
});

// Clear test database before each test
beforeEach(async () => {
  try {
    // Check if the connection is established and db is available
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    // Get all collections and delete all documents
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
});
