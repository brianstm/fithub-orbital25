import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole, IUser } from '../models/User';
import { Document, Types } from 'mongoose';

// Extend the Request interface to include a user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id: string;
        role: UserRole;
        name: string;
        email: string;
        profilePicture?: string;
      };
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.error('Not authorized, no token', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as {
        id: string;
      };

      // Find user and select all fields except password
      const user = (await User.findById(decoded.id).select('-password')) as
        | (Document<unknown, {}, IUser> & IUser & { _id: Types.ObjectId })
        | null;

      if (!user) {
        return res.error('Not authorized, user not found', 401);
      }

      // Store user info in request with explicit id field
      req.user = {
        id: user._id.toString(),
        _id: user._id.toString(),
        role: user.role,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      };

      next();
    } catch (error) {
      return res.error('Not authorized, invalid token', 401);
    }
  } catch (error) {
    return res.error('Authentication error', 401);
  }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.error('Not authorized as admin', 403);
  }
};

export const authorize = (role: UserRole | UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.error('Not authenticated', 401);
    }

    const roles = Array.isArray(role) ? role : [role];

    if (roles.includes(req.user.role as UserRole)) {
      next();
    } else {
      return res.error(`Not authorized as ${roles.join(' or ')}`, 403);
    }
  };
};
