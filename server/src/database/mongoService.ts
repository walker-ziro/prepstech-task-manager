import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, Task, IUser, ITask } from './mongodb.js';
import { User as UserType, Task as TaskType, TaskStatus, TaskPriority } from '../types.js';

export class MongoDBService {
  private static instance: MongoDBService;
  private isConnected = false;

  private constructor() {}

  static getInstance(): MongoDBService {
    if (!MongoDBService.instance) {
      MongoDBService.instance = new MongoDBService();
    }
    return MongoDBService.instance;
  }

  async connect(connectionString?: string): Promise<void> {
    if (this.isConnected) return;

    try {
      const mongoUri = connectionString || process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log('✅ Connected to MongoDB');
      this.isConnected = true;

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('📴 Disconnected from MongoDB');
    }
  }

  // Helper methods to convert between MongoDB documents and application types
  private mapUserDocToType(doc: IUser): UserType {
    return {
      id: (doc._id as any).toString(),
      email: doc.email,
      password: doc.password,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    };
  }

  private mapTaskDocToType(doc: ITask): TaskType {
    // Handle both old format (separate fields) and new format (extras object)
    const extras = doc.extras || {};
    
    return {
      id: (doc._id as any).toString(),
      title: doc.title,
      description: doc.description,
      status: doc.status,
      extras: {
        priority: extras.priority || (doc as any).priority || TaskPriority.Medium,
        due_date: extras.dueDate || (doc as any).due_date || null,
        tags: extras.tags || (doc as any).tags || [],
        // Include any additional custom fields from extras
        ...Object.fromEntries(
          Object.entries(extras).filter(([key]) => 
            !['priority', 'dueDate', 'tags'].includes(key)
          )
        )
      },
      user_id: doc.userId.toString(),
      created_at: doc.createdAt,
      updated_at: doc.updatedAt
    };
  }

  // User operations
  async createUser(email: string, hashedPassword: string): Promise<UserType> {
    try {
      const user = new User({
        email,
        password: hashedPassword
      });

      const savedUser = await user.save();
      return this.mapUserDocToType(savedUser);
    } catch (error) {
      if ((error as any).code === 11000) {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | null> {
    const user = await User.findOne({ email }).lean();
    return user ? this.mapUserDocToType(user as IUser) : null;
  }

  async getUserById(id: string): Promise<UserType | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    
    const user = await User.findById(id).lean();
    return user ? this.mapUserDocToType(user as IUser) : null;
  }

  // Task operations
  async createTask(
    title: string,
    description: string,
    status: TaskStatus,
    extras: {
      priority?: TaskPriority;
      dueDate?: string;
      tags?: string[];
      [key: string]: any;
    },
    userId: string
  ): Promise<TaskType> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const taskExtras = {
      priority: extras.priority || TaskPriority.Medium,
      dueDate: extras.dueDate || null,
      tags: extras.tags || [],
      ...extras
    };

    const task = new Task({
      title,
      description,
      status,
      extras: taskExtras,
      userId: new mongoose.Types.ObjectId(userId)
    });

    const savedTask = await task.save();
    return this.mapTaskDocToType(savedTask);
  }

  async getTasksByUserId(userId: string): Promise<TaskType[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const tasks = await Task.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    return tasks.map(task => this.mapTaskDocToType(task as ITask));
  }

  async getTaskById(id: string, userId: string): Promise<TaskType | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const task = await Task.findOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    }).lean();

    return task ? this.mapTaskDocToType(task as ITask) : null;
  }

  async updateTask(id: string, userId: string, updates: Partial<TaskType>): Promise<TaskType | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    // Convert the updates to MongoDB format
    const mongoUpdates: any = {};
    if (updates.title !== undefined) mongoUpdates.title = updates.title;
    if (updates.description !== undefined) mongoUpdates.description = updates.description;
    if (updates.status !== undefined) mongoUpdates.status = updates.status;
    if (updates.extras !== undefined) mongoUpdates.extras = updates.extras;
    mongoUpdates.updatedAt = new Date();

    const updatedTask = await Task.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      mongoUpdates,
      { new: true }
    ).lean();

    return updatedTask ? this.mapTaskDocToType(updatedTask as ITask) : null;
  }

  // Legacy updateTask method for backward compatibility
  async updateTaskLegacy(
    id: string,
    title: string,
    description: string,
    status: TaskStatus,
    priority: TaskPriority,
    dueDate: string | null,
    tags: string[],
    extras: Record<string, any>,
    userId: string
  ): Promise<TaskType | null> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const updatedTask = await Task.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(id), 
        userId: new mongoose.Types.ObjectId(userId) 
      },
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        extras: extras || {},
        updatedAt: new Date()
      },
      { new: true }
    ).lean();

    return updatedTask ? this.mapTaskDocToType(updatedTask as ITask) : null;
  }

  async deleteTask(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    const result = await Task.deleteOne({ 
      _id: new mongoose.Types.ObjectId(id), 
      userId: new mongoose.Types.ObjectId(userId) 
    });

    return result.deletedCount === 1;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; details: any }> {
    try {
      if (!this.isConnected) {
        return { status: 'error', details: { message: 'Not connected to MongoDB' } };
      }

      // Test database connection
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      } else {
        throw new Error('Database connection not available');
      }
      
      // Get some basic stats
      const userCount = await User.countDocuments();
      const taskCount = await Task.countDocuments();

      return {
        status: 'ok',
        details: {
          connected: true,
          database: mongoose.connection.name,
          users: userCount,
          tasks: taskCount,
          readyState: mongoose.connection.readyState
        }
      };
    } catch (error) {
      return {
        status: 'error',
        details: { message: (error as Error).message }
      };
    }
  }
}

export default MongoDBService.getInstance();
