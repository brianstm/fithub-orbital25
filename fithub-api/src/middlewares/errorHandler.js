export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);
  
  // If already processed as a response, pass through
  if (res.headersSent) {
    return next(err);
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Return standardized error response using our helper
  return res.error(message, statusCode);
}; 