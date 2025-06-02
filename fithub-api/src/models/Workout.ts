import mongoose, { Document, Schema } from 'mongoose';

export enum SetType {
  NORMAL = 'normal',
  WARM_UP = 'warm_up',
  DROP_SET = 'drop_set',
  FAILURE = 'failure'
}

export interface ISet {
  reps: number;
  weight?: number;
  duration?: number; // in seconds, for timed exercises
  distance?: number; // in meters, for cardio exercises
  type: SetType;
  notes?: string;
}

export interface IExercise {
  name: string;
  sets: ISet[];
  notes?: string;
}

export interface IWorkout extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  exercises: IExercise[];
  duration: number; // in minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SetSchema = new Schema<ISet>({
  reps: {
    type: Number,
    required: [true, 'Number of reps is required'],
    min: [0, 'Reps cannot be negative'],
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
  },
  duration: {
    type: Number,
    min: [0, 'Duration cannot be negative'],
  },
  distance: {
    type: Number,
    min: [0, 'Distance cannot be negative'],
  },
  type: {
    type: String,
    enum: Object.values(SetType),
    default: SetType.NORMAL,
  },
  notes: {
    type: String,
  },
});

const WorkoutSchema = new Schema<IWorkout>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Workout title is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Workout date is required'],
      default: Date.now,
    },
    exercises: [
      {
        name: {
          type: String,
          required: [true, 'Exercise name is required'],
          trim: true,
        },
        sets: [SetSchema],
        notes: {
          type: String,
        },
      },
    ],
    duration: {
      type: Number,
      required: [true, 'Workout duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkout>('Workout', WorkoutSchema); 