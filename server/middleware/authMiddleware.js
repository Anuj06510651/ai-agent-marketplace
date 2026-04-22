import jwt from 'jsonwebtoken';

const fallbackSecret = 'dev-only-secret-change-in-env';

function getJwtSecret() {
  return process.env.JWT_SECRET || fallbackSecret;
}

export function createAuthToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token is required.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.auth = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}