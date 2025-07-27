// Compatibility wrapper for express-validator in ES modules
const getExpressValidator = () => {
  // Use dynamic require to avoid ES module issues
  const expressValidator = eval('require')('express-validator');
  return expressValidator;
};

const validator = getExpressValidator();

// Re-export the functions
export const check = validator.check;
export const validationResult = validator.validationResult;
export const body = validator.body;
export const param = validator.param;
export const query = validator.query;
