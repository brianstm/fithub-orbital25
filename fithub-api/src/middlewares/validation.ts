import { Request, Response, NextFunction } from 'express';
import { validationResult } from '../utils/validator';

// Define type for validation chains
type ValidationChain = any;

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Run all validations sequentially
      for (const validation of validations) {
        await validation.run(req);
      }

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        errors: [{ msg: 'Server error during validation' }]
      });
    }
  };
}; 