import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';

const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Generate UUID
        const uuid = uuidv4();

        // Create new user with UUID
        const newUser = new User({
            username,
            password,
            users: uuid  // Store UUID in the 'users' field
        });

        await newUser.save();
        
        // Return success message along with the UUID
        res.status(201).json({ 
            message: 'User created successfully',
            userId: uuid
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Return success message along with the UUID
        res.json({ 
            message: 'Login successful', 
            userId: user.users  // Send back the UUID
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

export default router;
