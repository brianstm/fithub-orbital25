import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import connectDB from './config/database';

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
import { errorHandler } from './middlewares/errorHandler.js';
import { responseHandler } from './middlewares/responseHandler';

// Initialize dotenv
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8000;

// Middleware
app.use(helmet());

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:5173',
    'http://localhost:3001',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply response standardization middleware
app.use(responseHandler);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

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

// Basic route
app.get('/api', (req, res) => {
  res.success({ message: 'Welcome to FitHub API' });
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

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server only if not in test environment
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  }
};

// Only start the server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

export default app;
