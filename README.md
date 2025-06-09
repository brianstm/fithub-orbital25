# FitHub

## Overview

FitHub is a web platform designed to optimize the gym experience for fitness enthusiasts. It combines a gym booking system with a community-driven space for social interaction, workout tracking, and AI-powered workout suggestions. FitHub helps users seamlessly reserve gym time slots, connect with like-minded individuals, and track their progress, fostering an environment of motivation and accountability.

## Made by:

- Brians Tjipto Meidianto
- Kacey Isaiah Yonathan

## Features

### Core Features

- **User Authentication & Profiles**: Secure login/signup with JWT and customizable user profiles.
- **Community Forum**: Post, comment, upvote/downvote, and categorize fitness topics.
- **Gym Booking System**: Reserve gym slots, view availability, and manage bookings via integrated calendar.
- **Workout Tracking & AI Suggestions**: Log workouts, track progress, and get personalized AI workout suggestions.

### Extended Features

- **Sharing & Social Features**: Share workouts, milestones, and add friends to track progress.
- **Achievements & Gamification**: Earn badges, track streaks, and compete on leaderboards.
- **Gym Usage Heatmap**: View peak/off-peak gym usage times to plan workouts efficiently.
- **Calendar Sync for Bookings**: Sync gym bookings with Google/Apple/Outlook Calendars.
- **AI-Generated Workout Variations**: Receive alternative exercises to avoid plateaus.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, Zustand
- **Backend**: Express.js, MongoDB (via MongoDB Atlas)
- **Authentication**: JWT
- **AI Services**: Gemini API for workout suggestions
- **Deployment**: Vercel (frontend), Render (backend)
- **CI/CD**: GitHub Actions for automated testing and deployment

## Security & Authentication

- JWT-based Authentication for secure user sessions
- Passwords securely hashed with bcrypt
- Role-based access control (RBAC) for different user types

## Testing

- **Unit Testing**: Jest for API testing
- **CI/CD**: GitHub Actions for continuous integration and deployment

## API Documentation

- Swagger for API documentation
- Postman Collection for manual API testing

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/brianstm/fithub-orbital25.git
   cd fithub-orbital25
   ```
2. Install dependencies:
   ```bash
   cd fithub
   npm install --legacy-peer-deps
   cd ..
   cd fithub-api
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
