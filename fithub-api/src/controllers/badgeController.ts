import { Request, Response } from 'express';
import { BadgeService } from '../services/badgeService';
import User from '../models/User';

// Get user's badges
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const user = await User.findById(req.user.id).select('badges stats');
    if (!user) {
      return res.error('User not found', 404);
    }

    res.success({
      badges: user.badges,
      stats: user.stats,
    });
  } catch (error) {
    console.error('Error fetching user badges:', error);
    res.error('Server error while fetching badges', 500);
  }
};

// Check and award new badges to user
export const checkUserBadges = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const newBadges = await BadgeService.checkAndAwardBadges(req.user.id);

    res.success({
      newBadges,
      message: newBadges.length > 0 
        ? `Congratulations! You earned ${newBadges.length} new badge${newBadges.length > 1 ? 's' : ''}!`
        : 'No new badges earned',
    });
  } catch (error) {
    console.error('Error checking user badges:', error);
    res.error('Server error while checking badges', 500);
  }
};

// Get leaderboards
export const getLeaderboards = async (req: Request, res: Response) => {
  try {
    const leaderboards = await BadgeService.getLeaderboards();

    res.success({
      leaderboards,
    });
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    res.error('Server error while fetching leaderboards', 500);
  }
};

// Get user stats
export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    // Update user stats first
    await BadgeService.updateUserStats(req.user.id);

    const user = await User.findById(req.user.id).select('stats badges');
    if (!user) {
      return res.error('User not found', 404);
    }

    res.success({
      stats: user.stats,
      badgeCount: user.badges.length,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.error('Server error while fetching stats', 500);
  }
};

// Get all available badge definitions (for UI reference)
export const getBadgeDefinitions = async (req: Request, res: Response) => {
  try {
    const { BADGE_DEFINITIONS } = await import('../services/badgeService');
    
    const badgeDefinitions = BADGE_DEFINITIONS.map(badge => ({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
    }));

    res.success({
      badges: badgeDefinitions,
    });
  } catch (error) {
    console.error('Error fetching badge definitions:', error);
    res.error('Server error while fetching badge definitions', 500);
  }
}; 