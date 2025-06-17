import { Request, Response } from 'express';
import Gym from '../models/Gym';
import Booking from '../models/Booking';
import { startOfWeek, endOfWeek, format, parseISO, getHours, addDays } from 'date-fns';

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

// Get gym peak hours analysis
export const getGymPeakHours = async (req: Request, res: Response) => {
  try {
    const gymId = req.params.id;
    const gym = await Gym.findById(gymId);
    
    if (!gym) {
      return res.error('Gym not found', 404);
    }

    // Get bookings for the last 4 weeks to analyze patterns
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    
    const bookings = await Booking.find({
      gym: gymId,
      date: { $gte: fourWeeksAgo },
      status: { $in: ['confirmed', 'completed'] }
    });

    // Analyze peak hours by day of week and hour
    const hourlyData: { [key: string]: { [hour: number]: number } } = {
      'Monday': {},
      'Tuesday': {},
      'Wednesday': {},
      'Thursday': {},
      'Friday': {},
      'Saturday': {},
      'Sunday': {}
    };

    bookings.forEach(booking => {
      const dayOfWeek = format(booking.date, 'EEEE');
      const startHour = parseInt(booking.startTime.split(':')[0]);
      const endHour = parseInt(booking.endTime.split(':')[0]);
      
      // Count each hour the booking spans
      for (let hour = startHour; hour < endHour; hour++) {
        if (!hourlyData[dayOfWeek][hour]) {
          hourlyData[dayOfWeek][hour] = 0;
        }
        hourlyData[dayOfWeek][hour]++;
      }
    });

    // Calculate peak and off-peak hours
    const peakHours: { [key: string]: { peak: number[], offPeak: number[] } } = {};
    
    Object.keys(hourlyData).forEach(day => {
      const dayData = hourlyData[day];
      const hours = Object.keys(dayData).map(h => parseInt(h));
      const counts = Object.values(dayData);
      
      if (counts.length === 0) {
        peakHours[day] = { peak: [], offPeak: [] };
        return;
      }
      
      const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
      const peak: number[] = [];
      const offPeak: number[] = [];
      
      hours.forEach(hour => {
        if (dayData[hour] >= avgCount * 1.2) { // 20% above average = peak
          peak.push(hour);
        } else if (dayData[hour] <= avgCount * 0.8) { // 20% below average = off-peak
          offPeak.push(hour);
        }
      });
      
      peakHours[day] = { peak, offPeak };
    });

    // Calculate overall busy score for each hour across all days
    const overallHourlyBusyness: { [hour: number]: number } = {};
    for (let hour = 6; hour <= 22; hour++) { // Typical gym hours
      let totalBookings = 0;
      let totalDays = 0;
      
      Object.keys(hourlyData).forEach(day => {
        if (hourlyData[day][hour] !== undefined) {
          totalBookings += hourlyData[day][hour];
          totalDays++;
        }
      });
      
      overallHourlyBusyness[hour] = totalDays > 0 ? totalBookings / totalDays : 0;
    }

    res.success({
      data: {
        gym: {
          _id: gym._id,
          name: gym.name,
          capacity: gym.capacity
        },
        peakHours,
        hourlyData,
        overallHourlyBusyness,
        recommendations: generateRecommendations(peakHours, overallHourlyBusyness)
      }
    });
  } catch (error) {
    console.error('Error analyzing gym peak hours:', error);
    res.error('Server error while analyzing peak hours', 500);
  }
};

// Get gym availability for a specific date with peak hours info
export const getGymAvailability = async (req: Request, res: Response) => {
  try {
    const gymId = req.params.id;
    const { date } = req.query;
    
    if (!date) {
      return res.error('Date parameter is required', 400);
    }

    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.error('Gym not found', 404);
    }

    const targetDate = parseISO(date as string);
    const dayOfWeek = format(targetDate, 'EEEE');
    
    // Get existing bookings for the date
    const existingBookings = await Booking.find({
      gym: gymId,
      date: targetDate,
      status: { $in: ['confirmed', 'pending'] }
    });

    // Get peak hours data
    const peakHoursResponse = await getGymPeakHoursData(gymId);
    
    // Generate hourly availability
    const hourlyAvailability = [];
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const openHour = parseInt((isWeekend ? gym.openingHours.weekend.open : gym.openingHours.weekday.open).split(':')[0]);
    const closeHour = parseInt((isWeekend ? gym.openingHours.weekend.close : gym.openingHours.weekday.close).split(':')[0]);
    
    for (let hour = openHour; hour < closeHour; hour++) {
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      const bookingsAtHour = existingBookings.filter(booking => {
        const startHour = parseInt(booking.startTime.split(':')[0]);
        const endHour = parseInt(booking.endTime.split(':')[0]);
        return hour >= startHour && hour < endHour;
      });
      
      const occupancy = bookingsAtHour.length;
      const availableSlots = gym.capacity - occupancy;
      const occupancyRate = (occupancy / gym.capacity) * 100;
      
      let busyLevel = 'low';
      if (occupancyRate >= 80) busyLevel = 'high';
      else if (occupancyRate >= 50) busyLevel = 'medium';
      
      // Check if it's a peak hour
      const isPeakHour = peakHoursResponse.peakHours[dayOfWeek]?.peak.includes(hour) || false;
      const isOffPeakHour = peakHoursResponse.peakHours[dayOfWeek]?.offPeak.includes(hour) || false;
      
      hourlyAvailability.push({
        hour,
        timeSlot,
        availableSlots,
        occupancy,
        occupancyRate: Math.round(occupancyRate),
        busyLevel,
        isPeakHour,
        isOffPeakHour,
        recommended: isOffPeakHour && availableSlots > gym.capacity * 0.5
      });
    }

    res.success({
      data: {
        gym: {
          _id: gym._id,
          name: gym.name,
          capacity: gym.capacity
        },
        date: format(targetDate, 'yyyy-MM-dd'),
        dayOfWeek,
        hourlyAvailability,
        summary: {
          totalSlots: (closeHour - openHour) * gym.capacity,
          bookedSlots: existingBookings.reduce((total, booking) => {
            const duration = parseInt(booking.endTime.split(':')[0]) - parseInt(booking.startTime.split(':')[0]);
            return total + duration;
          }, 0),
          peakHours: peakHoursResponse.peakHours[dayOfWeek]?.peak || [],
          offPeakHours: peakHoursResponse.peakHours[dayOfWeek]?.offPeak || []
        }
      }
    });
  } catch (error) {
    console.error('Error getting gym availability:', error);
    res.error('Server error while getting availability', 500);
  }
};

// Helper function to get peak hours data (used internally)
async function getGymPeakHoursData(gymId: string) {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
  
  const bookings = await Booking.find({
    gym: gymId,
    date: { $gte: fourWeeksAgo },
    status: { $in: ['confirmed', 'completed'] }
  });

  const hourlyData: { [key: string]: { [hour: number]: number } } = {
    'Monday': {}, 'Tuesday': {}, 'Wednesday': {}, 'Thursday': {},
    'Friday': {}, 'Saturday': {}, 'Sunday': {}
  };

  bookings.forEach(booking => {
    const dayOfWeek = format(booking.date, 'EEEE');
    const startHour = parseInt(booking.startTime.split(':')[0]);
    const endHour = parseInt(booking.endTime.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      if (!hourlyData[dayOfWeek][hour]) {
        hourlyData[dayOfWeek][hour] = 0;
      }
      hourlyData[dayOfWeek][hour]++;
    }
  });

  const peakHours: { [key: string]: { peak: number[], offPeak: number[] } } = {};
  
  Object.keys(hourlyData).forEach(day => {
    const dayData = hourlyData[day];
    const hours = Object.keys(dayData).map(h => parseInt(h));
    const counts = Object.values(dayData);
    
    if (counts.length === 0) {
      peakHours[day] = { peak: [], offPeak: [] };
      return;
    }
    
    const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
    const peak: number[] = [];
    const offPeak: number[] = [];
    
    hours.forEach(hour => {
      if (dayData[hour] >= avgCount * 1.2) {
        peak.push(hour);
      } else if (dayData[hour] <= avgCount * 0.8) {
        offPeak.push(hour);
      }
    });
    
    peakHours[day] = { peak, offPeak };
  });

  return { peakHours, hourlyData };
}

// Helper function to generate recommendations
function generateRecommendations(peakHours: any, overallHourlyBusyness: any) {
  const recommendations = [];
  
  // Find the least busy hours overall
  const sortedHours = Object.entries(overallHourlyBusyness)
    .sort(([,a], [,b]) => (a as number) - (b as number))
    .slice(0, 3);
  
  if (sortedHours.length > 0) {
    const bestHours = sortedHours.map(([hour]) => `${hour}:00`);
    recommendations.push({
      type: 'best_times',
      title: 'Best Times to Visit',
      description: `Least crowded hours: ${bestHours.join(', ')}`,
      hours: bestHours
    });
  }
  
  // Weekend vs weekday recommendations
  const weekdayPeaks = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    .flatMap(day => peakHours[day]?.peak || []);
  const weekendPeaks = ['Saturday', 'Sunday']
    .flatMap(day => peakHours[day]?.peak || []);
  
  if (weekendPeaks.length < weekdayPeaks.length) {
    recommendations.push({
      type: 'weekend_advantage',
      title: 'Weekend Advantage',
      description: 'Weekends are generally less crowded than weekdays',
      suggestion: 'Consider weekend workouts for a more relaxed experience'
    });
  }
  
  return recommendations;
} 