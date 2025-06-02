import mongoose, { Document, Schema } from "mongoose";

export interface IGym extends Document {
  name: string;
  address: string;
  description: string;
  capacity: number;
  openingHours: {
    weekday: {
      open: string;
      close: string;
    };
    weekend: {
      open: string;
      close: string;
    };
  };
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GymSchema = new Schema<IGym>(
  {
    name: {
      type: String,
      required: [true, "Gym name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },
    openingHours: {
      weekday: {
        open: {
          type: String,
          required: [true, "Weekday opening time is required"],
        },
        close: {
          type: String,
          required: [true, "Weekday closing time is required"],
        },
      },
      weekend: {
        open: {
          type: String,
          required: [true, "Weekend opening time is required"],
        },
        close: {
          type: String,
          required: [true, "Weekend closing time is required"],
        },
      },
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IGym>("Gym", GymSchema);
