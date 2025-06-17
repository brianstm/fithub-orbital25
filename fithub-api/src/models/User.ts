import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IBadge {
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'strength' | 'milestone' | 'achievement';
  earnedAt: Date;
  criteria?: any; // Store the criteria that was met to earn this badge
}

export interface IUserStats {
  totalWorkouts: number;
  totalVolumeLiftedKg: number;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate?: Date;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  averageWorkoutsPerWeek: number;
  personalRecords: Map<string, number>; // exercise name -> max weight
  totalWorkoutDuration: number;
  favoriteExercises: string[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio?: string;
  profilePicture?: string;
  fitnessLevel?: string;
  goals?: [string];
  badges: IBadge[];
  stats: IUserStats;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const BadgeSchema = new Schema<IBadge>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['consistency', 'strength', 'milestone', 'achievement'],
    required: true,
  },
  earnedAt: {
    type: Date,
    default: Date.now,
  },
  criteria: {
    type: Schema.Types.Mixed,
  },
});

const UserStatsSchema = new Schema<IUserStats>({
  totalWorkouts: {
    type: Number,
    default: 0,
  },
  totalVolumeLiftedKg: {
    type: Number,
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastWorkoutDate: {
    type: Date,
  },
  weeklyWorkouts: {
    type: Number,
    default: 0,
  },
  monthlyWorkouts: {
    type: Number,
    default: 0,
  },
  averageWorkoutsPerWeek: {
    type: Number,
    default: 0,
  },
  personalRecords: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  totalWorkoutDuration: {
    type: Number,
    default: 0,
  },
  favoriteExercises: [{
    type: String,
  }],
});

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    profilePicture: {
      type: String,
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    goals: [
      {
        type: String,
        trim: true,
      },
    ],
    badges: [BadgeSchema],
    stats: {
      type: UserStatsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
