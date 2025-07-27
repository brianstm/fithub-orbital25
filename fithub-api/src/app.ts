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

// Import middleware
import { errorHandler } from './middlewares/errorHandler';
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
    'https://fithub-orbital25-seven.vercel.app',
    'https://fithub-orbital25-nus.vercel.app',
    'https://fithub-api.onrender.com',
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

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server only if not in test environment
const startServer = async () => {
  if (process.env.NODE_ENV !== 'test') {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Handle server shutdown gracefully
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
  }
};

// Start the server
startServer().catch(console.error);

export default app;
