import React, { useState } from 'react';
import { useRequest, HttpMethod, KeyValueRow } from '../../hooks/useRequest';
import { Project } from '../../hooks/useProjects';
import styles from './RequestBuilder.module.css';

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const METHOD_COLORS: Record<HttpMethod, string> = {
    GET: '#22c55e',
    POST: '#3b82f6',
    PUT: '#f59e0b',
    PATCH: '#a78bfa',
    DELETE: '#ef4444',
};

interface Props {
    project: Project;
}

function KeyValueEditor({
    rows,
    onChange,
}: {
    rows: KeyValueRow[];
    onChange: (rows: KeyValueRow[]) => void;
}) {
    const update = (i: number, field: keyof KeyValueRow, value: string | boolean) => {
        const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
        // auto-add empty row at end if last row has content
        if (i === rows.length - 1 && value !== '' && field !== 'enabled') {
            next.push({ key: '', value: '', enabled: true });
        }
        onChange(next);
    };

    const remove = (i: number) => {
        if (rows.length === 1) return;
        onChange(rows.filter((_, idx) => idx !== i));
    };

    return (
        <div className={styles.kvTable}>
            {rows.map((row, i) => (
                <div key={i} className={styles.kvRow}>
                    <input
                        type="checkbox"
                        className={styles.kvCheck}
                        checked={row.enabled}
                        onChange={(e) => update(i, 'enabled', e.target.checked)}
                    />
                    <input
                        className={styles.kvInput}
                        placeholder="Key"
                        value={row.key}
                        onChange={(e) => update(i, 'key', e.target.value)}
                    />
                    <input
                        className={styles.kvInput}
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) => update(i, 'value', e.target.value)}
                    />
                    <button className={styles.kvRemove} onClick={() => remove(i)}>×</button>
                </div>
            ))}
        </div>
    );
}

function statusColor(code: number) {
    if (code < 300) return '#22c55e';
    if (code < 400) return '#f59e0b';
    return '#ef4444';
}

function buildFetchSnippet(
    method: HttpMethod,
    url: string,
    params: KeyValueRow[],
    headers: KeyValueRow[],
    body: string,
): string {
    if (!url.trim()) return '// Enter a URL above first';

    // Append enabled query params
    const enabledParams = params.filter((r) => r.enabled && r.key);
    let fullUrl = url.trim();
    if (enabledParams.length > 0) {
        const qs = enabledParams
            .map((r) => `${encodeURIComponent(r.key)}=${encodeURIComponent(r.value)}`)
            .join('&');
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + qs;
    }

    const hasBody = body.trim() !== '' && ['POST', 'PUT', 'PATCH'].includes(method);
    const enabledHeaders = headers.filter((r) => r.enabled && r.key);
    const allHeaders = [...enabledHeaders];
    if (hasBody && !allHeaders.find((r) => r.key.toLowerCase() === 'content-type')) {
        allHeaders.unshift({ key: 'Content-Type', value: 'application/json', enabled: true });
    }

    let snippet = `const response = await fetch('${fullUrl}', {\n`;
    snippet += `  method: '${method}',\n`;

    if (allHeaders.length > 0) {
        snippet += `  headers: {\n`;
        allHeaders.forEach((r, i) => {
            const comma = i < allHeaders.length - 1 ? ',' : '';
            snippet += `    '${r.key}': '${r.value}'${comma}\n`;
        });
        snippet += `  },\n`;
    }

    if (hasBody) {
        snippet += `  body: JSON.stringify(${body.trim()}),\n`;
    }

    snippet += `});\n\nconst data = await response.json();\nconsole.log(data);`;
    return snippet;
}

const RequestBuilder: React.FC<Props> = ({ project }) => {
    const {
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
    } = useRequest();

    const [copied, setCopied] = useState(false);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') sendRequest();
    };

    const fetchSnippet = buildFetchSnippet(method, url, params, headers, body);

    const copySnippet = () => {
        navigator.clipboard.writeText(fetchSnippet).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const prettyBody = (() => {
        if (response?.data === undefined) return '';
        try {
            return JSON.stringify(response.data, null, 2);
        } catch {
            return String(response.data);
        }
    })();

    return (
        <div className={styles.container}>
            {/* Project name header */}
            <div className={styles.projectHeader}>
                <span className={styles.projectName}>{project.name}</span>
            </div>

            {/* URL bar */}
            <div className={styles.urlBar}>
                <select
                    className={styles.methodSelect}
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HttpMethod)}
                    style={{ color: METHOD_COLORS[method] }}
                >
                    {METHODS.map((m) => (
                        <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
                            {m}
                        </option>
                    ))}
                </select>
                <input
                    className={styles.urlInput}
                    placeholder="https://api.example.com/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    className={styles.sendBtn}
                    onClick={sendRequest}
                    disabled={sending || !url.trim()}
                >
                    {sending ? 'Sending…' : 'Send'}
                </button>
            </div>

            {/* Request tabs */}
            <div className={styles.tabs}>
                {(['params', 'headers', 'body', 'code'] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''} ${tab === 'code' ? styles.tabCode : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'code' ? '</> Code' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'params' && (
                    <KeyValueEditor rows={params} onChange={setParams} />
                )}
                {activeTab === 'headers' && (
                    <KeyValueEditor rows={headers} onChange={setHeaders} />
                )}
                {activeTab === 'body' && (
                    <textarea
                        className={styles.bodyEditor}
                        placeholder={'{\n  "key": "value"\n}'}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        spellCheck={false}
                    />
                )}
                {activeTab === 'code' && (
                    <div className={styles.codePanel}>
                        <button className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`} onClick={copySnippet}>
                            {copied ? '✓ Kopierad' : 'Kopiera'}
                        </button>
                        <pre className={styles.codeSnippet}>{fetchSnippet}</pre>
                    </div>
                )}
            </div>

            {/* Response */}
            <div className={styles.responseDivider} />
            <div className={styles.responseSection}>
                {!response && !requestError && !sending && (
                    <p className={styles.responsePlaceholder}>Hit Send to see the response</p>
                )}
                {sending && <p className={styles.responsePlaceholder}>Sending…</p>}
                {requestError && <p className={styles.responseError}>{requestError}</p>}
                {response && (
                    <>
                        <div className={styles.responseBar}>
                            <span className={styles.statusBadge} style={{ color: statusColor(response.status) }}>
                                {response.status} {response.statusText}
                            </span>
                            <span className={styles.responseMeta}>{response.duration} ms</span>
                        </div>
                        <pre className={styles.responseBody}>{prettyBody}</pre>
                    </>
                )}
            </div>
        </div>
    );
};

export default RequestBuilder;
