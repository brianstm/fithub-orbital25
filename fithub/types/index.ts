export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  profilePicture?: string;
  bio?: string;
  fitnessLevel?: string;
}

export interface Gym {
  _id: string;
  name: string;
  address: string;
  description?: string;
  facilities?: string[];
  amenities?: string[];
  openingHours?: {
    weekday?: {
      open: string;
      close: string;
    };
    weekend?: {
      open: string;
      close: string;
    };
  };
  images?: string[];
  rating?: number;
  reviews?: number;
  capacity?: number;
}

export interface Booking {
  _id: string;
  gym: Gym;
  user: User;
  date: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSet {
  _id: string;
  reps: number;
  weight: number;
  type: "warm_up" | "normal" | "failure";
  notes?: string;
}

export interface Exercise {
  _id: string;
  name: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  _id: string;
  title: string;
  date: string | Date;
  duration: number;
  exercises: Exercise[];
  notes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  category?: string;
  likes: Array<string | { _id: string; name: string }>;
  likesCount: number;
  comments: Comment[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  currentUser?: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  images?: string[];
  isEdit: boolean;
}

export interface Comment {
  _id: string;
  content: string;
  userId: string;
  author: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt?: string;
  isEdit: boolean;
}

export interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
}

export interface UserStatCardProps {
  label: string;
  value: string;
  previous: string;
  change: number;
  icon: React.ReactNode;
}

export interface WorkoutListProps {
  workouts: Workout[];
  isLoading?: boolean;
  showAll?: boolean;
}

export interface BookingListProps {
  bookings: Booking[];
  isLoading?: boolean;
  showAll?: boolean;
}

export interface UserStatsProps {
  isLoading?: boolean;
}

export interface GymListProps {
  gyms: Gym[];
  isLoading?: boolean;
  showAll?: boolean;
}
