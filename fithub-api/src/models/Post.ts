import mongoose, { Document, Schema } from 'mongoose';

interface IBadge {
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'strength' | 'milestone' | 'achievement';
  earnedAt: Date;
}

export interface IPost extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  category: string;
  images: string[];
  badges?: IBadge[];
  likes: mongoose.Types.ObjectId[];
  comments: {
    _id?: mongoose.Types.ObjectId;
    content: string;
    author: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt?: Date;
    isEdit?: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
  isEdit?: boolean;
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
    required: true,
  },
});

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    badges: [BadgeSchema],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        content: {
          type: String,
          required: [true, 'Comment content is required'],
        },
        author: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Comment author is required'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IPost>('Post', PostSchema);
