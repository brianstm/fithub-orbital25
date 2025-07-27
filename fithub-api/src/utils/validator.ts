// ES module compatible import for express-validator
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const expressValidator = require('express-validator');

// Re-export the functions
export const check = expressValidator.check;
export const validationResult = expressValidator.validationResult;
export const body = expressValidator.body;
export const param = expressValidator.param;
export const query = expressValidator.query;
