import { Router, Response } from 'express';
import { db } from '../config/firebase';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// All project routes require authentication
router.use((req, res, next) => authenticate(req as AuthRequest, res, next));

// GET /api/projects — fetch all projects belonging to the logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const snap = await db
            .collection('projects')
            .where('ownerId', '==', req.user!.id)
            .get();

        const projects = snap.docs
            .map((doc) => ({ id: doc.id, ...doc.data() as { name: string; ownerId: string; createdAt: string } }))
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        res.json(projects);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        res.status(500).json({ error: message });
    }
});

// POST /api/projects — create a new project
router.post('/', async (req: AuthRequest, res: Response) => {
    const { name } = req.body as { name?: string };
    if (!name?.trim()) {
        res.status(400).json({ error: 'Project name is required' });
        return;
    }

    try {
        const ref = db.collection('projects').doc();
        const project = {
            name: name.trim(),
            ownerId: req.user!.id,
            createdAt: new Date().toISOString(),
        };
        await ref.set(project);
        res.status(201).json({ id: ref.id, ...project });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        res.status(500).json({ error: message });
    }
});

export default router;
