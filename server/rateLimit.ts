
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { 
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many login attempts, please try again later'
  }
});

export const loanLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 loan requests per day
  message: {
    status: 'error',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Daily loan request limit exceeded'
  }
});

export const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
