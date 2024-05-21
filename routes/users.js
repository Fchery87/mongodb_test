import express from 'express';
import db from '../db/conn.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// ======= User document minimum requirements ====== //
/**
 * {
 *  "email": "test@test.com",
 *  "password": "password123",
 *  "username": "testuser1"
 * }
 */

// ============== CRUD Operations ====================== //

/**
 * Create a new user
 * POST /users/
 */
router.post('/', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const newUser = req.body;
    const result = await collection.insertOne(newUser);
    res.status(201).json(result); // Return the full result, which includes insertedId, etc.
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get all users
 * GET /users/
 */
router.get('/', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const users = await collection.find({}).toArray();
    res.status(200).json(users); // Return all users in the collection
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Get a single user by the id
 * GET /users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const userId = new ObjectId(req.params.id);
    const user = await collection.findOne({ _id: userId });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(user); // Return the found user
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Update a user by the id
 * PUT /users/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const userId = new ObjectId(req.params.id);
    const updatedUser = req.body;
    const result = await collection.updateOne(
      { _id: userId },
      { $set: updatedUser }
    );
    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ message: 'User updated successfully' });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Sign in a user
 * POST /users/signin
 */
router.post('/signin', async (req, res) => {
  try {
    const collection = await db.collection('users');
    const { email, password } = req.body;

    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (password !== user.password) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    res.status(200).json(user); // Return the user upon successful sign-in
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Delete a user by the id
 * DELETE /users/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const collection = await db.collection('users');
    let userId;
    try {
      userId = new ObjectId(req.params.id);
    } catch (error) {
      console.error('Invalid user ID:', error);
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    console.log(`Attempting to delete user with ID: ${userId}`);

    const result = await collection.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json({ message: 'User deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Add bulk users
 * POST /users/bulk
 */
router.post('/bulk', async (req, res) => {
    try {
      const collection = await db.collection('users');
      const newUsers = req.body; 
      const result = await collection.insertMany(newUsers);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding bulk users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  /**
   * Delete multiple users
   * DELETE /users/bulk
   */
  router.delete('/bulk', async (req, res) => {
    try {
      const collection = await db.collection('users');
      const userIds = req.body.userIds.map(id => new ObjectId(id)); 
      
      const result = await collection.deleteMany({ _id: { $in: userIds } });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: 'No users found to delete' });
      } else {
        res.status(200).json({ message: 'Users deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
