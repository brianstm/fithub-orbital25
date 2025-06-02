import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking';
import Gym from '../models/Gym';

// Get all bookings (for admins) or user's bookings (for regular users)
export const getBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    
    // If not admin, only show user's own bookings
    if (req.user.role !== 'admin') {
      query = { user: req.user._id };
    }

    const bookings = await Booking.find(query)
      .populate('gym')
      .populate('user', 'name email profilePicture')
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.success({
      count: bookings.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.error('Server error while fetching bookings', 500);
  }
};

// Get single booking by ID
export const getBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('gym', 'name address');
    
    if (!booking) {
      return res.error('Booking not found', 404);
    }
    
    // Check if booking belongs to user or user is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.error('Not authorized to access this booking', 403);
    }
    
    res.success(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.error('Server error while fetching booking', 500);
  }
};

// Create new booking
export const createBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    // Add user ID to request body
    req.body.user = req.user._id;
    
    // Check if gym exists
    const gym = await Gym.findById(req.body.gym);
    if (!gym) {
      return res.error('Gym not found', 404);
    }
    
    // Check for existing bookings at the same time slot
    const existingBooking = await Booking.findOne({
      gym: req.body.gym,
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] }
    });
    
    if (existingBooking) {
      return res.error('This time slot is already booked', 400);
    }
    
    // Create booking
    const booking = await Booking.create(req.body);
    
    res.success(booking, 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.error('Server error while creating booking', 500);
  }
};

// Update booking status (admin can update any booking, users can only cancel their own)
export const updateBookingStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const { status } = req.body;
    
    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      return res.error('Invalid booking status', 400);
    }
    
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.error('Booking not found', 404);
    }
    
    // Users can only cancel their own bookings
    if (req.user.role !== 'admin') {
      if (booking.user.toString() !== req.user._id.toString()) {
        return res.error('Not authorized to update this booking', 403);
      }
      
      if (status !== BookingStatus.CANCELLED) {
        return res.error('Users can only cancel bookings', 403);
      }
    }
    
    booking.status = status as BookingStatus;
    await booking.save();
    
    res.success(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.error('Server error while updating booking', 500);
  }
};

// Delete booking (admin only)
export const deleteBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.error('Not authorized to delete bookings', 403);
    }

    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.error('Booking not found', 404);
    }
    
    res.success({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.error('Server error while deleting booking', 500);
  }
}; 