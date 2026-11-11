import { verifyToken, decodeToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/errors.js';

// Authentication Middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 'Token tidak ditemukan', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return errorResponse(res, 'Token tidak valid atau expired', 401);
  }

  req.user = decoded;
  next();
};

// Optional Authentication Middleware
export const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

// Authorization Middleware (untuk admin)
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return errorResponse(res, 'Anda tidak memiliki akses', 403);
  }
  next();
};

// Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
};

// CORS Middleware
export const corsMiddleware = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
};
