import { Request } from 'express';

export enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Done = 'done',
}

export enum TaskPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  extras: {
    priority: TaskPriority;
    due_date: string | null;
    tags: string[];
    [key: string]: any;
  };
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  extras?: {
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  extras?: {
    priority?: TaskPriority;
    dueDate?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    created_at: Date;
    updated_at: Date;
  };
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}
