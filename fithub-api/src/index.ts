import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

// Import routes
import authRoutes from './routes/authRoutes';
import gymRoutes from './routes/gymRoutes';
import bookingRoutes from './routes/bookingRoutes';
import workoutRoutes from './routes/workoutRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import uploadRoutes from './routes/uploadRoutes';
import aiRoutes from './routes/aiRoutes';
import badgeRoutes from './routes/badgeRoutes';

// Import middleware
import { errorHandler } from './middlewares/errorHandler';
import { responseHandler } from './middlewares/responseHandler';
import mongoose from 'mongoose';

// Initialize dotenv
dotenv.config();

// Initialize Express
const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:5173',
    'http://localhost:3001',
    'https://fithub-orbital.vercel.app',
    'https://fithub-api.vercel.app',
    /\.vercel\.app$/,
    /\.netlify\.app$/,
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply response standardization middleware
app.use(responseHandler);

// Rate limiting - more lenient for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Reduced from 100000 for better performance
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    // Skip rate limiting for health checks
    return req.path === '/api' || req.path === '/api/health';
  },
});
app.use(limiter);

// Database connection with better error handling
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MongoDB URI is not defined');
    throw new Error('Database configuration error');
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    }
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Middleware to ensure DB connection
const withDB = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error',
    });
  }
};

// Apply DB middleware to all API routes
app.use('/api', withDB);

// Health check route
app.get('/api', (req, res) => {
  res.success({
    message: 'Welcome to FitHub API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api',
      '/api/health',
      '/api/auth',
      '/api/gyms',
      '/api/bookings',
      '/api/workouts',
      '/api/posts',
      '/api/ai',
      '/api/upload',
      '/api/users',
      '/api/badges',
    ],
  });
});

// Set up Swagger documentation
const setupSwagger = async () => {
  try {
    // Dynamically import Swagger to avoid ESM/CJS issues
    const swaggerJsdoc = await import('swagger-jsdoc');
    const swaggerUi = await import('swagger-ui-express');

    const options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'FitHub API',
          version: '1.0.0',
          description: 'API for FitHub fitness application',
          contact: {
            name: 'FitHub Team',
          },
        },
        servers: [
          {
            url: 'http://localhost:8000',
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
        tags: [
          {
            name: 'Auth',
            description: 'Authentication endpoints',
          },
          {
            name: 'Users',
            description: 'User operations',
          },
          {
            name: 'Gyms',
            description: 'Gym facility operations',
          },
          {
            name: 'Bookings',
            description: 'Gym booking operations',
          },
          {
            name: 'Workouts',
            description: 'Workout tracking operations',
          },
          {
            name: 'Posts',
            description: 'Community forum operations',
          },
          {
            name: 'AI',
            description: 'AI-powered workout suggestions',
          },
          {
            name: 'Upload',
            description: 'File upload operations',
          },
          {
            name: 'Badges',
            description: 'User badges and leaderboards',
          },
        ],
      },
      apis: ['./src/routes/*.ts', './src/models/*.ts'],
    };

    const specs = swaggerJsdoc.default(options);
    app.use(
      '/api-docs',
      swaggerUi.default.serve,
      swaggerUi.default.setup(specs, { explorer: true })
    );
    console.log('Swagger documentation initialized');
  } catch (error) {
    console.error('Error setting up Swagger:', error);
  }
};

// Initialize Swagger
setupSwagger();

// Error handling middleware
app.use(errorHandler);

// For Vercel, we need to export the app as default
export default app;
