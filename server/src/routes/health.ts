import { Router } from 'express';
import { getMongoService } from '../database/init.js';

const router = Router();

/**
 * Health check endpoint
 */
router.get('/health', async (req, res) => {
  try {
    // Use MongoDB service for health check
    const mongoService = getMongoService();
    const health = await mongoService.healthCheck();
    
    res.status(health.status === 'ok' ? 200 : 503).json({
      status: health.status,
      message: health.status === 'ok' ? 'Database is healthy' : 'Database health check failed',
      timestamp: new Date().toISOString(),
      database: {
        type: 'mongodb',
        status: health.status,
        details: health.details
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      database: {
        type: 'mongodb',
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Unknown error' }
      }
    });
  }
});

/**
 * Database stats endpoint
 */
router.get('/stats', async (req, res) => {
  try {
    const mongoService = getMongoService();
    const health = await mongoService.healthCheck();
    
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      database: {
        type: 'mongodb',
        status: health.status,
        details: health.details
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Stats retrieval failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
