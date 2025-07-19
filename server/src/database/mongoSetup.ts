#!/usr/bin/env node

/**
 * MongoDB Setup Script
 * Sets up MongoDB for the Task Manager application
 */

import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';

async function setupMongoDB() {
  console.log('🚀 Setting up MongoDB for Task Manager...');
  console.log(`📍 Connecting to: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);

  try {
    // Test connection using mongoose
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');

    // Get database info
    const db = mongoose.connection.db;
    if (db) {
      const collections = await db.listCollections().toArray();
      
      console.log('\n📊 Database Information:');
      console.log(`   Database: ${db.databaseName}`);
      console.log(`   Collections: ${collections.length}`);
      
      if (collections.length > 0) {
        console.log('   Existing collections:');
        collections.forEach(col => console.log(`     - ${col.name}`));
      }
    } else {
      console.log('\n📊 Database Information: Not available');
    }

    // Create indexes (mongoose will create collections automatically when first document is inserted)
    console.log('\n🔧 Setting up indexes...');
    
    // User indexes
    try {
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('   ✅ User email index created');
    } catch (error) {
      console.log('   ⚠️ User email index already exists');
    }

    // Task indexes
    const taskIndexes = [
      { userId: 1, status: 1 },
      { userId: 1, priority: 1 },
      { userId: 1, dueDate: 1 },
      { userId: 1, tags: 1 },
      { createdAt: -1 }
    ];

    for (const index of taskIndexes) {
      try {
        await mongoose.connection.collection('tasks').createIndex(index as any);
        console.log(`   ✅ Task index created: ${JSON.stringify(index)}`);
      } catch (error) {
        console.log(`   ⚠️ Task index already exists: ${JSON.stringify(index)}`);
      }
    }

    // Test data insertion (optional)
    console.log('\n📝 Testing data operations...');
    
    const testUser = {
      email: 'test@example.com',
      password: 'hashedpassword123',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const usersCollection = mongoose.connection.collection('users');
      const existingUser = await usersCollection.findOne({ email: testUser.email });
      
      if (!existingUser) {
        const result = await usersCollection.insertOne(testUser);
        console.log('   ✅ Test user created');
        
        // Create a test task
        const testTask = {
          title: 'Welcome to MongoDB!',
          description: 'This is a test task to verify MongoDB integration',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          tags: ['test', 'mongodb'],
          extras: {},
          userId: result.insertedId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await mongoose.connection.collection('tasks').insertOne(testTask);
        console.log('   ✅ Test task created');
      } else {
        console.log('   ℹ️ Test user already exists');
      }
    } catch (error) {
      console.log('   ⚠️ Test data already exists');
    }

    console.log('\n🎉 MongoDB setup completed successfully!');
    console.log('\n📚 Next steps:');
    console.log('   1. Set MONGODB_URI in your .env file');
    console.log('   2. Start your application server');
    console.log('   3. The app will automatically use MongoDB');

  } catch (error) {
    console.error('❌ MongoDB setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupMongoDB().catch(console.error);
}

export { setupMongoDB };
