import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from './config/passport';
import proxyRouter from './routes/proxy';
import dbRouter from './routes/db';
import authRouter from './routes/auth';
import projectsRouter from './routes/projects';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/db', dbRouter);

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
