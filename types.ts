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
  priority: TaskPriority;
  dueDate: string | null; // ISO date string
  tags: string[];
  extras: Record<string, any>; // For JSON data like tags, due date
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response interfaces
export interface CreateTaskRequest {
  title: string;
  description: string;
  status: TaskStatus;
  extras?: Record<string, any>;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  extras?: Record<string, any>;
}

export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
