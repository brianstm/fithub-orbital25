import mongoose, { Document, Schema } from 'mongoose';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  gym: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    gym: {
      type: Schema.Types.ObjectId,
      ref: 'Gym',
      required: [true, 'Gym is required'],
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate bookings
BookingSchema.index({ user: 1, gym: 1, date: 1, startTime: 1 }, { unique: true });

export default mongoose.model<IBooking>('Booking', BookingSchema); 