import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';

const router = Router();

// GET /api/db/ping — tries a lightweight Firestore read to verify connectivity
router.get('/ping', async (_req: Request, res: Response) => {
    try {
        await db.collection('_ping').limit(1).get();
        res.json({ status: 'connected', message: 'Firestore is reachable' });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(503).json({ status: 'disconnected', error: message });
    }
});

export default router;
