import User, { IBadge, IUser } from '../models/User';
import Workout from '../models/Workout';
import { startOfWeek, endOfWeek, differenceInDays } from 'date-fns';

export interface BadgeDefinition {
  name: string;
  description: string;
  icon: string;
  category: 'consistency' | 'strength' | 'milestone' | 'achievement';
  checkCriteria: (user: IUser, workouts: any[]) => boolean;
  criteria?: any;
}

// Define all available badges
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Consistency Badges
  {
    name: 'First Workout',
    description: 'Completed your first workout',
    icon: '🎯',
    category: 'milestone',
    checkCriteria: (user, workouts) => workouts.length >= 1,
  },
  {
    name: 'Week Warrior',
    description: 'Worked out 3 times in a week',
    icon: '⚡',
    category: 'consistency',
    checkCriteria: (user, workouts) => {
      const thisWeek = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      return thisWeek.length >= 3;
    },
  },
  {
    name: 'Consistency King',
    description: 'Maintained a 7-day workout streak',
    icon: '👑',
    category: 'consistency',
    checkCriteria: (user) => user.stats.currentStreak >= 7,
  },
  {
    name: 'Marathon Streaker',
    description: 'Maintained a 30-day workout streak',
    icon: '🔥',
    category: 'consistency',
    checkCriteria: (user) => user.stats.longestStreak >= 30,
  },
  {
    name: 'Dedication Master',
    description: 'Completed 100 total workouts',
    icon: '💎',
    category: 'milestone',
    checkCriteria: (user) => user.stats.totalWorkouts >= 100,
  },

  // Strength Badges
  {
    name: 'Iron Lifter',
    description: 'Lifted 1,000kg total volume',
    icon: '🏋️',
    category: 'strength',
    checkCriteria: (user) => user.stats.totalVolumeLiftedKg >= 1000,
  },
  {
    name: 'Beast Mode',
    description: 'Lifted 10,000kg total volume',
    icon: '🦍',
    category: 'strength',
    checkCriteria: (user) => user.stats.totalVolumeLiftedKg >= 10000,
  },
  {
    name: 'Strength Legend',
    description: 'Lifted 50,000kg total volume',
    icon: '⚡',
    category: 'strength',
    checkCriteria: (user) => user.stats.totalVolumeLiftedKg >= 50000,
  },
  {
    name: 'Personal Record',
    description: 'Set a new personal record',
    icon: '🎖️',
    category: 'achievement',
    checkCriteria: (user) => user.stats.personalRecords && user.stats.personalRecords.size > 0,
  },

  // Time-based Badges
  {
    name: 'Time Master',
    description: 'Completed 1,000 minutes of workouts',
    icon: '⏰',
    category: 'milestone',
    checkCriteria: (user) => user.stats.totalWorkoutDuration >= 1000,
  },
  {
    name: 'Endurance Champion',
    description: 'Completed 5,000 minutes of workouts',
    icon: '🏃',
    category: 'milestone',
    checkCriteria: (user) => user.stats.totalWorkoutDuration >= 5000,
  },
];

export class BadgeService {
  // Calculate total volume lifted from workouts
  static calculateTotalVolume(workouts: any[]): number {
    return workouts.reduce((total, workout) => {
      return total + workout.exercises.reduce((exerciseTotal: number, exercise: any) => {
        return exerciseTotal + exercise.sets.reduce((setTotal: number, set: any) => {
          return setTotal + (set.weight || 0) * (set.reps || 0);
        }, 0);
      }, 0);
    }, 0);
  }

  // Calculate workout streak
  static calculateStreak(workouts: any[]): { current: number; longest: number } {
    if (workouts.length === 0) return { current: 0, longest: 0 };

    // Sort workouts by date (most recent first)
    const sortedWorkouts = workouts
      .map(w => new Date(w.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date();
    const mostRecentWorkout = sortedWorkouts[0];

    // Check if current streak is active (last workout was within 2 days)
    const daysSinceLastWorkout = differenceInDays(today, mostRecentWorkout);
    if (daysSinceLastWorkout <= 2) {
      currentStreak = 1;

      // Count consecutive days
      for (let i = 1; i < sortedWorkouts.length; i++) {
        const daysDiff = differenceInDays(sortedWorkouts[i - 1], sortedWorkouts[i]);
        if (daysDiff <= 2) {
          currentStreak++;
          tempStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const daysDiff = differenceInDays(sortedWorkouts[i - 1], sortedWorkouts[i]);
      if (daysDiff <= 2) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
  }

  // Update user stats based on workouts
  static async updateUserStats(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) return;

    const workouts = await Workout.find({ user: userId }).sort({ date: -1 });

    // Calculate stats
    const totalVolume = this.calculateTotalVolume(workouts);
    const streaks = this.calculateStreak(workouts);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

    // Calculate personal records
    const personalRecords = new Map<string, number>();
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const maxWeight = Math.max(...exercise.sets.map(set => set.weight || 0));
        const currentRecord = personalRecords.get(exercise.name) || 0;
        if (maxWeight > currentRecord) {
          personalRecords.set(exercise.name, maxWeight);
        }
      });
    });

    // Update user stats
    user.stats = {
      totalWorkouts: workouts.length,
      totalVolumeLiftedKg: totalVolume,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      lastWorkoutDate: workouts.length > 0 ? workouts[0].date : undefined,
      weeklyWorkouts: 0, // Calculate based on current week
      monthlyWorkouts: 0, // Calculate based on current month
      averageWorkoutsPerWeek: 0, // Calculate based on total time
      personalRecords,
      totalWorkoutDuration: totalDuration,
      favoriteExercises: [], // Calculate most frequent exercises
    };

    await user.save();
  }

  // Check and award badges to a user
  static async checkAndAwardBadges(userId: string): Promise<IBadge[]> {
    const user = await User.findById(userId);
    if (!user) return [];

    const workouts = await Workout.find({ user: userId });
    const newBadges: IBadge[] = [];

    // Update stats first
    await this.updateUserStats(userId);
    
    // Refresh user data after stats update
    const updatedUser = await User.findById(userId);
    if (!updatedUser) return [];

    for (const badgeDefinition of BADGE_DEFINITIONS) {
      // Check if user already has this badge
      const alreadyHasBadge = updatedUser.badges.some(badge => badge.name === badgeDefinition.name);
      
      if (!alreadyHasBadge && badgeDefinition.checkCriteria(updatedUser, workouts)) {
        const newBadge: IBadge = {
          name: badgeDefinition.name,
          description: badgeDefinition.description,
          icon: badgeDefinition.icon,
          category: badgeDefinition.category,
          earnedAt: new Date(),
          criteria: badgeDefinition.criteria,
        };

        updatedUser.badges.push(newBadge);
        newBadges.push(newBadge);
      }
    }

    if (newBadges.length > 0) {
      await updatedUser.save();
    }

    return newBadges;
  }

  // Get leaderboard data
  static async getLeaderboards(): Promise<{
    weeklyStreaks: any[];
    totalVolume: any[];
    totalWorkouts: any[];
    consistency: any[];
  }> {
    const users = await User.find({ role: 'user' })
      .select('name profilePicture stats badges')
      .sort({ 'stats.currentStreak': -1 });

    return {
      weeklyStreaks: users
        .sort((a, b) => (b.stats?.currentStreak || 0) - (a.stats?.currentStreak || 0))
        .slice(0, 10)
        .map((user, index) => ({
          rank: index + 1,
          user: {
            name: user.name,
            profilePicture: user.profilePicture,
          },
          streak: user.stats?.currentStreak || 0,
          badges: user.badges?.length || 0,
        })),

      totalVolume: users
        .sort((a, b) => (b.stats?.totalVolumeLiftedKg || 0) - (a.stats?.totalVolumeLiftedKg || 0))
        .slice(0, 10)
        .map((user, index) => ({
          rank: index + 1,
          user: {
            name: user.name,
            profilePicture: user.profilePicture,
          },
          volume: user.stats?.totalVolumeLiftedKg || 0,
          badges: user.badges?.length || 0,
        })),

      totalWorkouts: users
        .sort((a, b) => (b.stats?.totalWorkouts || 0) - (a.stats?.totalWorkouts || 0))
        .slice(0, 10)
        .map((user, index) => ({
          rank: index + 1,
          user: {
            name: user.name,
            profilePicture: user.profilePicture,
          },
          workouts: user.stats?.totalWorkouts || 0,
          badges: user.badges?.length || 0,
        })),

      consistency: users
        .sort((a, b) => (b.stats?.longestStreak || 0) - (a.stats?.longestStreak || 0))
        .slice(0, 10)
        .map((user, index) => ({
          rank: index + 1,
          user: {
            name: user.name,
            profilePicture: user.profilePicture,
          },
          longestStreak: user.stats?.longestStreak || 0,
          badges: user.badges?.length || 0,
        })),
    };
  }
} 