import React from 'react';
import styles from './EmptyState.module.css';

interface Props {
    onCreateClick: () => void;
}

const EmptyState: React.FC<Props> = ({ onCreateClick }) => (
    <div className={styles.container}>
        <div className={styles.icon}>{'{ }'}</div>
        <h2 className={styles.title}>No projects yet</h2>
        <p className={styles.subtitle}>Create your first project to start building requests</p>
        <button className={styles.button} onClick={onCreateClick}>
            + New project
        </button>
    </div>
);

export default EmptyState;
