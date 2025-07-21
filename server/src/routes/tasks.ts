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
  extras: Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    dueDate: Joi.string().allow('', null).default(null),
    tags: Joi.array().items(Joi.string()).default([])
  }).unknown(true).default({
    priority: 'medium',
    dueDate: null,
    tags: []
  })
});

const updateTaskSchema = Joi.object({
  title: Joi.string().max(255),
  description: Joi.string().allow('').max(1000),
  status: Joi.string().valid('pending', 'in-progress', 'done'),
  extras: Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.string().allow('', null),
    tags: Joi.array().items(Joi.string())
  }).unknown(true)
}).min(1); // Ensure at least one field is provided for an update

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

    const { title, description, status, extras }: CreateTaskRequest = value;
    const mongoService = getMongoService();
    const task = await mongoService.createTask(
      title,
      description || '',
      status as TaskStatus,
      extras || {
        priority: TaskPriority.Medium,
        dueDate: undefined,
        tags: [] as string[]
      },
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
    const existingTask = await mongoService.getTaskById(taskId, req.user!.id);
    if (!existingTask) {
      return res.status(404).json({ error: { message: 'Task not found' } });
    }

    const taskUpdates: Partial<Task> = {
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.status && { status: updates.status as TaskStatus }),
      ...(updates.extras && {
        extras: {
          ...existingTask.extras,
          ...updates.extras
        }
      })
    };

    const updatedTask = await mongoService.updateTask(taskId, req.user!.id, taskUpdates);
    if (!updatedTask) {
      return res.status(400).json({ error: { message: 'Update failed or no valid fields to update' } });
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

    // Prepare a brief summary for the AI
    const taskSummary = tasks.map((task: Task) => ({
      title: task.title,
      status: task.status,
      priority: task.extras?.priority,
    }));

    // Simplified prompt for concise and faster responses
    const prompt = tasks.length > 0
      ? `Based on this task list: ${JSON.stringify(taskSummary)}. Provide very brief (2-3 short paragraphs) and actionable productivity recommendations. Use markdown for simple formatting. Focus only on the most critical advice.`
      : `The user has no tasks. Provide a very brief (1-2 short paragraphs), encouraging message to help them start. Suggest 1-2 simple first steps. Use markdown for simple formatting.`;

    const generationConfig = {
      maxOutputTokens: 150,
      temperature: 0.7,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const aiRecommendations = result.response.text();
    
    res.json({ insight: { recommendations: aiRecommendations } });

  } catch (error) {
    console.error('Error generating insights:', error);
    next(error);
  }
});

export default router;
