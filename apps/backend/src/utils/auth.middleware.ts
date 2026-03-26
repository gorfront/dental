import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dental_key_2026';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

export const requireRoles = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};