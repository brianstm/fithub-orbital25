import { Request, Response } from 'express';
import User from '../models/User';

// Get all users (excluding admins)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.success({ data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.error('Error fetching users', 500);
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.error('User not found', 404);
    }
    res.success({ data: user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.error('Error fetching user', 500);
  }
};

// Update user profile
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Check if user is updating their own profile or is admin
    if (req.user?._id.toString() !== req.params.id && req.user?.role !== 'admin') {
      return res.error('Not authorized to update this profile', 403);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.error('User not found', 404);
    }

    res.success({ data: user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.error('Error updating user', 500);
  }
};

// Delete a user (self or by admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }
    
    // Allow users to delete their own account or admins to delete any account
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.error('Not authorized to delete this user', 403);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.error('User not found', 404);
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.success({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.error('Server error while deleting user', 500);
  }
}; 