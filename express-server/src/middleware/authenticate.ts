import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppUser } from '../config/passport';

export interface AuthRequest extends Request {
    user?: AppUser;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AppUser;
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
