import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { AppUser } from '../config/passport';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Step 1 — redirect user to Google
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// Step 2 — Google redirects back here
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`, session: false }),
    (req: Request, res: Response) => {
        const user = req.user as AppUser;
        const token = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '7d' });
        // Send token to frontend via redirect query param
        res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// GET /api/auth/me — returns the current user (requires Bearer token)
router.get('/me', (req: Request, res: Response, next) => authenticate(req as AuthRequest, res, next), (req: Request, res: Response) => {
    res.json((req as AuthRequest).user);
});

export default router;
