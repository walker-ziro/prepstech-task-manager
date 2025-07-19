import express from 'express';
import Joi from 'joi';
import { getMongoService } from '../database/init.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { TaskStatus, TaskPriority, CreateTaskRequest, UpdateTaskRequest, Task } from '../types.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().allow('').max(1000),
  status: Joi.string().valid('pending', 'in-progress', 'done').default('pending'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.string().allow('', null).default(null),
  tags: Joi.array().items(Joi.string()).default([]),
  extras: Joi.object().default({})
});

const updateTaskSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow('').max(1000),
  status: Joi.string().valid('pending', 'in-progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.string().allow('', null),
  tags: Joi.array().items(Joi.string()),
  extras: Joi.object()
});

// Get all tasks for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const mongoService = getMongoService();
    const tasks = await mongoService.getTasksByUserId(req.user!.id);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const { title, description, status, priority, dueDate, tags, extras }: CreateTaskRequest = value;
    const mongoService = getMongoService();
    const task = await mongoService.createTask(
      title, 
      description, 
      status as TaskStatus, 
      priority as TaskPriority,
      dueDate || null,
      tags || [],
      extras || {},
      req.user!.id
    );
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value } = updateTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const taskId = req.params.id;
    const updates: UpdateTaskRequest = value;

    const mongoService = getMongoService();
    
    // Check if task exists and belongs to user
    const existingTask = await mongoService.getTaskById(taskId, req.user!.id);
    if (!existingTask) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    // Update the task
    const updatedTask = await mongoService.updateTask(taskId, req.user!.id, updates);
    if (!updatedTask) {
      return res.status(400).json({ error: { message: 'No valid fields to update' } });
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const taskId = req.params.id;
    const mongoService = getMongoService();
    const deleted = await mongoService.deleteTask(taskId, req.user!.id);
    
    if (!deleted) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get task insights using Gemini AI
router.post('/insights', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: { message: 'Tasks array is required' } });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: { message: 'Gemini API key not configured' } });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Calculate task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: Task) => task.status === 'done').length;
    const inProgressTasks = tasks.filter((task: Task) => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter((task: Task) => task.status === 'pending').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Prepare task data for AI analysis
    const taskSummary = tasks.map((task: Task) => ({
      title: task.title,
      status: task.status,
      description: task.description,
      extras: task.extras
    }));

    // Group tasks by status for better analysis
    const tasksByStatus = {
      pending: tasks.filter((task: Task) => task.status === 'pending'),
      inProgress: tasks.filter((task: Task) => task.status === 'in-progress'),
      completed: tasks.filter((task: Task) => task.status === 'done')
    };

    const prompt = `
      Analyze these tasks and provide structured productivity insights and recommendations:
      
      Task Data: ${JSON.stringify(taskSummary, null, 2)}
      
      Current Statistics:
      - Total Tasks: ${totalTasks}
      - Completed: ${completedTasks}
      - In Progress: ${inProgressTasks}
      - Pending: ${pendingTasks}
      - Completion Rate: ${completionRate}%
      
      Please provide practical productivity insights in a conversational, helpful tone. Format your response as markdown with clear sections and proper spacing between sentences and paragraphs:

      ## 📊 Overall Assessment

      [Brief overview of productivity patterns and current status. Use separate sentences with proper spacing.]

      ## ✅ What's Working Well

      - [Positive observation 1]
      - [Positive observation 2]
      - [Positive observation 3]

      ## 🎯 Areas for Improvement

      - [Specific area 1 to focus on]
      - [Specific area 2 to focus on]
      - [Specific area 3 to focus on]

      ## 📋 Task-Specific Recommendations

      ### High Priority Actions
      [Specific actions for urgent tasks. Each sentence should be clear and separated.]

      ### In Progress Tasks
      [Advice for current in-progress tasks with specific task titles. Provide actionable steps.]

      ### Planning & Organization
      [Recommendations for pending tasks with specific task titles. Include planning strategies.]

      ## 💡 Productivity Tips

      **Tip 1:** [Practical tip with clear explanation]

      **Tip 2:** [Another practical tip with detailed guidance]

      **Tip 3:** [Final tip to boost overall productivity]

      Keep the tone encouraging and provide specific, actionable advice. Reference actual task titles when making recommendations. Ensure proper spacing between sentences and use clear paragraph breaks.
    `;

    const result = await model.generateContent(prompt);
    const aiRecommendations = result.response.text();

    // Combine statistics with AI recommendations
    const insight = {
      statistics: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate
      },
      recommendations: aiRecommendations
    };

    res.json({ insight });
  } catch (error) {
    console.error('Error generating insights:', error);
    next(error);
  }
});

export default router;
