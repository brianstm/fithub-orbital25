import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.error('Email already in use', 400);
    }

    // Only allow admin role if specified in the request and by an existing admin
    let userRole = 'user';
    if (role === 'admin') {
      // Check if the request is from an admin (you might need more robust authorization here)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const jwtSecret = process.env.JWT_SECRET || 'default_secret';
          
          const decoded = jwt.verify(token, jwtSecret) as any;
          const adminUser = await User.findById(decoded.id);
          if (adminUser && adminUser.role === 'admin') {
            userRole = 'admin';
          }
        } catch (error) {
          // If token verification fails, default to USER role
          userRole = 'user';
        }
      }
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      role: userRole,
    });

    await user.save();

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';

    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.success({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    res.error('Server error during registration', 500);
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.error('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.error('Invalid credentials', 401);
    }

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'default_secret';

    const token = jwt.sign(
      { id: user._id },
      jwtSecret,
      { expiresIn: '30d' }
    );

    res.success({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.error('Server error during login', 500);
  }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.error('User not found', 404);
    }

    res.success(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.error('Server error while retrieving profile', 500);
  }
}; 