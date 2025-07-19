import mongoService from './mongoService.js';

let db: typeof mongoService | null = null;

export const initializeDatabase = async (): Promise<typeof mongoService> => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is required. Please configure MongoDB connection.');
  }

  console.log('Initializing MongoDB database...');
  await mongoService.connect(mongoUri);
  db = mongoService;
  return mongoService;
};

export const getDatabase = (): typeof mongoService => {
  if (!db) {
    throw new Error('MongoDB database not initialized. Call initializeDatabase first.');
  }
  return db;
};

export const getMongoService = () => {
  return mongoService;
};

export const isDatabaseMongoDB = (): boolean => {
  return true;
};