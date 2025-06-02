/**
 * Mock data for Swagger documentation and testing
 * These objects can be used as example responses in Swagger docs
 */

// User mock data
export const userMock = {
  _id: '60d21b4667d0d8992e610c85',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  profileImage: 'https://example.com/profile.jpg',
  bio: 'Fitness enthusiast looking to improve my strength and endurance.',
  fitnessLevel: 'intermediate',
  goals: ['Lose weight', 'Build muscle'],
  createdAt: '2023-05-15T09:12:23.456Z',
  updatedAt: '2023-05-16T10:13:24.567Z'
};

// Admin user mock
export const adminUserMock = {
  _id: '60d21b4667d0d8992e610c86',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  profileImage: 'https://example.com/admin.jpg',
  bio: 'Gym administrator and certified personal trainer.',
  fitnessLevel: 'advanced',
  goals: ['Help others achieve fitness goals'],
  createdAt: '2023-05-10T08:11:22.345Z',
  updatedAt: '2023-05-11T09:12:23.456Z'
};

// Auth tokens mock
export const authTokensMock = {
  success: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwZDIxYjQ2NjdkMGQ4OTkyZTYxMGM4NSIsImlhdCI6MTYyMzc2MTY5MCwiZXhwIjoxNjI2MzUzNjkwfQ.MZLCTpvaQYQ0gVJJ8BJWA6sXCMHWUNYnZOSRhERUfLk',
  user: userMock
};

// Gym mock data
export const gymMock = {
  _id: '60d21b4667d0d8992e610c87',
  name: 'FitHub Central',
  address: '123 Fitness Street, Workout City',
  description: 'State-of-the-art fitness center with the latest equipment and amenities.',
  openingHours: '08:00',
  closingHours: '22:00',
  capacity: 100,
  amenities: ['Cardio Zone', 'Free Weights', 'Group Classes', 'Sauna', 'Swimming Pool'],
  imageUrl: 'https://example.com/gym.jpg',
  createdAt: '2023-04-01T08:00:00.000Z',
  updatedAt: '2023-04-02T09:00:00.000Z'
};

// Booking mock data
export const bookingMock = {
  _id: '60d21b4667d0d8992e610c88',
  user: '60d21b4667d0d8992e610c85',
  gym: gymMock,
  date: '2023-06-15',
  startTime: '10:00',
  endTime: '11:30',
  status: 'confirmed',
  createdAt: '2023-06-10T14:30:45.678Z',
  updatedAt: '2023-06-11T09:15:30.789Z'
};

// Set types for workouts
export const setMock = {
  reps: 12,
  weight: 70,
  type: 'reps',
  duration: null,
  distance: null
};

export const setTimeMock = {
  reps: null,
  weight: null,
  type: 'time',
  duration: 60,
  distance: null
};

export const setDistanceMock = {
  reps: null,
  weight: null,
  type: 'distance',
  duration: 900,
  distance: 5
};

// Exercise mock data
export const exerciseMock = {
  _id: '60d21b4667d0d8992e610c89',
  name: 'Bench Press',
  sets: [setMock, setMock, setMock],
  notes: 'Felt strong today, increased weight on final set.'
};

export const exerciseCardioMock = {
  _id: '60d21b4667d0d8992e610c90',
  name: 'Running',
  sets: [setDistanceMock],
  notes: 'Easy pace, focused on endurance.'
};

export const exercisePlankMock = {
  _id: '60d21b4667d0d8992e610c91',
  name: 'Plank',
  sets: [setTimeMock, setTimeMock],
  notes: 'Worked on core stability.'
};

// Workout mock data
export const workoutMock = {
  _id: '60d21b4667d0d8992e610c92',
  user: '60d21b4667d0d8992e610c85',
  title: 'Chest and Triceps',
  date: '2023-06-10',
  duration: 75,
  exercises: [exerciseMock, exercisePlankMock],
  notes: 'Great workout, felt the pump in chest and triceps.',
  createdAt: '2023-06-10T19:30:00.000Z',
  updatedAt: '2023-06-10T19:30:00.000Z'
};

export const workoutCardioMock = {
  _id: '60d21b4667d0d8992e610c93',
  user: '60d21b4667d0d8992e610c85',
  title: 'Cardio Session',
  date: '2023-06-12',
  duration: 45,
  exercises: [exerciseCardioMock],
  notes: 'Focused on building endurance.',
  createdAt: '2023-06-12T18:00:00.000Z',
  updatedAt: '2023-06-12T18:00:00.000Z'
};

// Post mock data
export const commentMock = {
  _id: '60d21b4667d0d8992e610c94',
  content: 'Great progress! Keep it up!',
  user: {
    _id: '60d21b4667d0d8992e610c86',
    name: 'Admin User',
    profileImage: 'https://example.com/admin.jpg'
  },
  createdAt: '2023-06-05T14:30:00.000Z'
};

export const postMock = {
  _id: '60d21b4667d0d8992e610c95',
  content: 'Just finished a great workout session at FitHub Central! 💪 #fitness #progress',
  user: {
    _id: '60d21b4667d0d8992e610c85',
    name: 'John Doe',
    profileImage: 'https://example.com/profile.jpg'
  },
  likes: ['60d21b4667d0d8992e610c86'],
  likesCount: 1,
  comments: [commentMock],
  commentsCount: 1,
  imageUrl: 'https://example.com/workout-post.jpg',
  createdAt: '2023-06-05T13:45:00.000Z',
  updatedAt: '2023-06-05T14:30:05.000Z'
};

// AI workout suggestion mock data
export const workoutSuggestionMock = {
  title: 'Intermediate Strength Training',
  description: 'A balanced workout focusing on building overall strength with emphasis on the upper body.',
  duration: 60,
  exercises: [
    {
      name: 'Bench Press',
      sets: 3,
      repsPerSet: '8-10',
      restBetweenSets: '90 seconds',
      notes: 'Focus on proper form and controlled movement'
    },
    {
      name: 'Pull-Ups',
      sets: 3,
      repsPerSet: '6-8',
      restBetweenSets: '90 seconds',
      notes: 'Use assisted pull-up machine if needed'
    },
    {
      name: 'Squats',
      sets: 4,
      repsPerSet: '10-12',
      restBetweenSets: '2 minutes',
      notes: 'Keep weight moderate and focus on depth'
    },
    {
      name: 'Shoulder Press',
      sets: 3,
      repsPerSet: '8-10',
      restBetweenSets: '90 seconds',
      notes: 'Maintain neutral spine throughout'
    },
    {
      name: 'Planks',
      sets: 3,
      duration: '45 seconds',
      restBetweenSets: '60 seconds',
      notes: 'Focus on engaging core muscles'
    }
  ],
  cooldown: 'Spend 5-10 minutes stretching all major muscle groups worked'
};

// AI profile summary mock data
export const profileSummaryMock = {
  overview: 'John has been consistently training for 6 months with a focus on strength and muscle building. His dedication has led to significant improvements in overall fitness.',
  strengths: [
    'Consistent attendance (4-5 workouts per week)',
    'Excellent progress in compound lifts (20% increase in bench press)',
    'Good form on most exercises'
  ],
  areas_for_improvement: [
    'Could benefit from more variety in workout routines',
    'Cardio sessions are infrequent',
    'Recovery periods could be optimized'
  ],
  recommendations: [
    'Add 1-2 cardio sessions per week for better cardiovascular health',
    'Consider incorporating periodization into training program',
    'Focus on progressive overload for continued strength gains',
    'Add more mobility work to prevent potential injuries'
  ],
  progress_metrics: {
    attendance_rate: '85%',
    strength_improvement: '20%',
    body_composition_change: 'Estimated 3% decrease in body fat'
  }
};

// Collection of all mock data for easy access
export const mockData = {
  user: userMock,
  adminUser: adminUserMock,
  authTokens: authTokensMock,
  gym: gymMock,
  booking: bookingMock,
  set: setMock,
  setTime: setTimeMock,
  setDistance: setDistanceMock,
  exercise: exerciseMock,
  exerciseCardio: exerciseCardioMock,
  exercisePlank: exercisePlankMock,
  workout: workoutMock,
  workoutCardio: workoutCardioMock,
  comment: commentMock,
  post: postMock,
  workoutSuggestion: workoutSuggestionMock,
  profileSummary: profileSummaryMock
}; 