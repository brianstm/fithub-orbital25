import { Response } from 'express';

declare global {
  namespace Express {
    interface Response {
      success: (data: any, statusCode?: number) => void;
      error: (message: string, statusCode?: number) => void;
    }
  }
} 