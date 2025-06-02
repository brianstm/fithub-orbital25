import { Request, Response } from 'express';
import Gym from '../models/Gym';

// Get all gyms
export const getGyms = async (req: Request, res: Response) => {
  try {
    const gyms = await Gym.find({}).sort({ name: 1 });
    res.success({ count: gyms.length, data: gyms });
  } catch (error) {
    console.error('Error fetching gyms:', error);
    res.error('Server error while fetching gyms', 500);
  }
};

// Get single gym by ID
export const getGym = async (req: Request, res: Response) => {
  try {
    const gym = await Gym.findById(req.params.id);
    
    if (!gym) {
      return res.error('Gym not found', 404);
    }
    
    res.success({ data: gym });
  } catch (error) {
    console.error('Error fetching gym:', error);
    res.error('Server error while fetching gym', 500);
  }
};

// Create new gym (admin only)
export const createGym = async (req: Request, res: Response) => {
  try {
    const gym = await Gym.create(req.body);
    res.success(gym, 201);
  } catch (error) {
    console.error('Error creating gym:', error);
    res.error('Server error while creating gym', 500);
  }
};

// Update gym (admin only)
export const updateGym = async (req: Request, res: Response) => {
  try {
    // First try to find the gym to ensure it exists
    const existingGym = await Gym.findById(req.params.id);
    if (!existingGym) {
      return res.error('Gym not found', 404);
    }

    // If gym exists, update it
    const updatedGym = await Gym.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.success({ data: updatedGym });
  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      return res.error('Gym not found', 404);
    }
    console.error('Error updating gym:', error);
    res.error('Server error while updating gym', 500);
  }
};

// Delete gym (admin only)
export const deleteGym = async (req: Request, res: Response) => {
  try {
    const gym = await Gym.findByIdAndDelete(req.params.id);
    
    if (!gym) {
      return res.error('Gym not found', 404);
    }
    
    res.success({ message: 'Gym deleted successfully' });
  } catch (error) {
    console.error('Error deleting gym:', error);
    res.error('Server error while deleting gym', 500);
  }
}; 