import { Router, Request, Response } from 'express';
import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

const router = Router();

interface ProxyRequestBody {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string>;
}

// POST /api/proxy  — forwards any HTTP request on behalf of the frontend
router.post('/', async (req: Request, res: Response) => {
    const { method, url, headers = {}, body, params } = req.body as ProxyRequestBody;

    if (!method || !url) {
        res.status(400).json({ error: 'method and url are required' });
        return;
    }

    const config: AxiosRequestConfig = {
        method: method.toUpperCase(),
        url,
        headers: headers as RawAxiosRequestHeaders,
        params,
        data: body,
        validateStatus: () => true,
    };

    try {
        const start = Date.now();
        const response = await axios(config);
        const duration = Date.now() - start;

        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data,
            duration,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        res.status(500).json({ error: message });
    }
});

export default router;
