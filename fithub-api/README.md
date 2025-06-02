# FitHub API

A comprehensive fitness management API for the FitHub application, providing endpoints for gym management, workout tracking, community posts, and AI-powered fitness recommendations.

## Features

- **User Authentication**: Secure registration and login with JWT authentication
- **Gym Management**: Browse and search for gym facilities
- **Booking System**: Reserve gym slots and equipment
- **Workout Tracking**: Log and analyze workout progress
- **Community Posts**: Share fitness achievements and tips
- **AI-Powered Recommendations**: Get personalized workout suggestions
- **File Upload**: Store user profile images and workout photos
- **Swagger Documentation**: Interactive API documentation

## Tech Stack

- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- Firebase Storage for file uploads
- Google Gemini AI for workout recommendations
- Swagger for API documentation

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- Firebase project with Storage enabled
- Google Gemini API key

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/fithub-api.git
   cd fithub-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=30d
   
   # Firebase config
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   FIREBASE_APP_ID=your_firebase_app_id
   FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   
   # Google Gemini AI API key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. The API will be available at `http://localhost:8000` and the Swagger documentation at `http://localhost:8000/api-docs`

## API Endpoints

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get user profile

### Gyms
- `GET /api/gyms` - Get all gyms
- `GET /api/gyms/:id` - Get gym details
- `POST /api/gyms` - Create a new gym (admin only)
- `PUT /api/gyms/:id` - Update gym details (admin only)
- `DELETE /api/gyms/:id` - Delete a gym (admin only)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create a new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Workouts
- `GET /api/workouts` - Get user's workouts
- `GET /api/workouts/:id` - Get workout details
- `POST /api/workouts` - Log a new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Community Posts
- `GET /api/posts` - Get community posts
- `GET /api/posts/:id` - Get post details
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike a post
- `POST /api/posts/:id/comments` - Comment on a post

### AI Features
- `POST /api/ai/workout-suggestions` - Get workout suggestions
- `GET /api/ai/profile-summary` - Get AI-generated profile summary
- `POST /api/ai/workout-plan` - Generate a complete workout plan

### File Uploads
- `POST /api/upload/image` - Upload an image to Firebase Storage
- `POST /api/upload/profile-image` - Upload and update profile image

## Documentation

For detailed API documentation, run the server and visit `http://localhost:8000/api-docs`.

## Testing

Run tests with:
```bash
npm test
```

## Folder Structure

```
fithub-api/
├── src/
│   ├── config/        # Configuration files
│   ├── controllers/   # Route controllers
│   ├── middlewares/   # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── app.ts         # Main application file
├── tests/             # Test files
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
