import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '../types.js';

// User Schema
export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Task Schema
export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  extras: {
    priority: TaskPriority;
    dueDate?: string;
    tags: string[];
    [key: string]: any;
  };
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending
  },
  extras: {
    type: Schema.Types.Mixed,
    default: {
      priority: TaskPriority.Medium,
      dueDate: null,
      tags: []
    }
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Create indexes for better performance
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, 'extras.priority': 1 });
TaskSchema.index({ userId: 1, 'extras.dueDate': 1 });
TaskSchema.index({ userId: 1, 'extras.tags': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
export const Task = mongoose.model<ITask>('Task', TaskSchema);
