import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
