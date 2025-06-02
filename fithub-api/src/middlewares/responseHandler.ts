import { Request, Response, NextFunction } from 'express';

// Extend Express Response interface to add our custom methods
declare global {
  namespace Express {
    interface Response {
      success: (data?: any, statusCode?: number) => Response;
      error: (message: string, statusCode?: number) => Response;
    }
  }
}

/**
 * Middleware to add standardized response methods to Express response object
 */
export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  // Add success response method
  res.success = function(data: any = {}, statusCode: number = 200) {
    // Handle mongoose documents
    if (data && typeof data === 'object' && data._doc) {
      data = data._doc;
    }
    
    // If data already contains 'data' property, use it as is
    if (data && typeof data === 'object' && 'data' in data) {
      return res.status(statusCode).json({
        success: true,
        ...data
      });
    }
    
    // Otherwise wrap in data property for backward compatibility with tests
    return res.status(statusCode).json({
      success: true,
      data: data
    });
  };

  // Add error response method
  res.error = function(message: string, statusCode: number = 400) {
    return res.status(statusCode).json({
      success: false,
      message
    });
  };

  next();
}; 