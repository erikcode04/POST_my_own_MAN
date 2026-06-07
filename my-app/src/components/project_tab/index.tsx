import React, { useState } from 'react';
import Sidebar from '../sidebar';
import EmptyState from '../empty_state';
import CreateProjectModal from '../create_project_modal';
import RequestBuilder from '../request_builder';
import { useProjects } from '../../hooks/useProjects';
import { Project } from '../../hooks/useProjects';
import styles from './ProjectTab.module.css';

const ProjectTab: React.FC = () => {
    const { projects, loading, createProject } = useProjects();
    const [showModal, setShowModal] = useState(false);
    const [activeProject, setActiveProject] = useState<Project | null>(null);

    return (
        <div className={styles.layout}>
            <Sidebar>
                <div className={styles.sidebarSection}>
                    <div className={styles.sidebarHeader}>
                        <span>Projects</span>
                        <button className={styles.sidebarNewBtn} onClick={() => setShowModal(true)} title="New project">+</button>
                    </div>
                    {!loading && projects.map((p) => (
                        <div
                            key={p.id}
                            className={`${styles.sidebarItem} ${activeProject?.id === p.id ? styles.sidebarItemActive : ''}`}
                            onClick={() => setActiveProject(p)}
                        >
                            {p.name}
                        </div>
                    ))}
                </div>
            </Sidebar>
            <main className={styles.main}>
                {loading ? null : activeProject ? (
                    <RequestBuilder project={activeProject} />
                ) : projects.length === 0 ? (
                    <EmptyState onCreateClick={() => setShowModal(true)} />
                ) : (
                    <div className={styles.projectList}>
                        {projects.map((p) => (
                            <div key={p.id} className={styles.projectCard} onClick={() => setActiveProject(p)}>
                                {p.name}
                            </div>
                        ))}
                        <button className={styles.newProjectBtn} onClick={() => setShowModal(true)}>
                            + New project
                        </button>
                    </div>
                )}
            </main>

            {showModal && (
                <CreateProjectModal
                    onCreate={createProject}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default ProjectTab;
