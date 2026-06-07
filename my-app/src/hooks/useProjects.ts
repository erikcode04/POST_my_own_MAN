import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:4000';

export interface Project {
    id: string;
    name: string;
    ownerId: string;
    createdAt: string;
}

export function useProjects() {
    const { token } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/projects`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch {
            setError('Failed to load projects');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const createProject = async (name: string): Promise<Project> => {
        const res = await fetch(`${API}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name }),
        });
        if (!res.ok) {
            const { error: msg } = await res.json();
            throw new Error(msg ?? 'Failed to create project');
        }
        const project: Project = await res.json();
        setProjects((prev) => [project, ...prev]);
        return project;
    };

    return { projects, loading, error, createProject };
}
