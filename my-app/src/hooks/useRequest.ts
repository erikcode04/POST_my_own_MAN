import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:4000';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface KeyValueRow {
    key: string;
    value: string;
    enabled: boolean;
}

export interface RequestResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
    duration: number;
}

export function useRequest() {
    const { token } = useAuth();

    const [method, setMethod] = useState<HttpMethod>('GET');
    const [url, setUrl] = useState('');
    const [params, setParams] = useState<KeyValueRow[]>([{ key: '', value: '', enabled: true }]);
    const [headers, setHeaders] = useState<KeyValueRow[]>([{ key: '', value: '', enabled: true }]);
    const [body, setBody] = useState('');
    const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'code'>('params');

    const [response, setResponse] = useState<RequestResponse | null>(null);
    const [sending, setSending] = useState(false);
    const [requestError, setRequestError] = useState<string | null>(null);

    const toObject = (rows: KeyValueRow[]) =>
        Object.fromEntries(rows.filter((r) => r.enabled && r.key).map((r) => [r.key, r.value]));

    const sendRequest = async () => {
        if (!url.trim()) return;
        setSending(true);
        setRequestError(null);
        setResponse(null);

        let parsedBody: unknown = undefined;
        if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
            try {
                parsedBody = JSON.parse(body);
            } catch {
                parsedBody = body;
            }
        }

        try {
            const res = await fetch(`${API}/api/proxy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    method,
                    url: url.trim(),
                    params: toObject(params),
                    headers: toObject(headers),
                    body: parsedBody,
                }),
            });
            const data: RequestResponse = await res.json();
            setResponse(data);
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Request failed');
        } finally {
            setSending(false);
        }
    };

    return {
        method, setMethod,
        url, setUrl,
        params, setParams,
        headers, setHeaders,
        body, setBody,
        activeTab, setActiveTab,
        response,
        sending,
        requestError,
        sendRequest,
    };
}
