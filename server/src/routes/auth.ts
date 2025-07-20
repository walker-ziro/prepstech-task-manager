import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getMongoService } from '../database/init.js';
import { AuthRequest, AuthResponse, AuthenticatedRequest } from '../types.js';

const router = express.Router();

// Password validation function
const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }
  
  return { isValid: true };
};

// Validation schemas
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Sign up route
router.post('/signup', async (req, res, next) => {
  try {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const { email, password }: AuthRequest = value;

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: { message: passwordValidation.message } });
    }

    // Check if user already exists
    const mongoService = getMongoService();
    const existingUser = await mongoService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: { message: 'User already exists with this email' } });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await mongoService.createUser(email, hashedPassword);

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const token = jwt.sign({ id: user.id, email }, jwtSecret, { expiresIn: '7d' });

    const response: AuthResponse = {
      user: { 
        id: user.id, 
        email,
        created_at: user.created_at,
        updated_at: user.updated_at 
      },
      token
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Login route
router.post('/login', async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: { message: error.details[0].message } });
    }

    const { email, password }: AuthRequest = value;

    // Find user
    const mongoService = getMongoService();
    const user = await mongoService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return res.status(401).json({ error: { message: 'Invalid credentials' } });
    }

    // Generate JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });

    const response: AuthResponse = {
      user: { 
        id: user.id, 
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at 
      },
      token
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;