import React, { useState, useRef, useCallback } from 'react';
import styles from './Sidebar.module.css';

const MIN_WIDTH = 180;
const MAX_WIDTH = 520;

interface SidebarProps {
    children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
    const [width, setWidth] = useState(260);
    const isResizing = useRef(false);

    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            isResizing.current = true;
            const startX = e.clientX;
            const startWidth = width;

            const onMouseMove = (moveEvent: MouseEvent) => {
                if (!isResizing.current) return;
                const delta = moveEvent.clientX - startX;
                const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta));
                setWidth(next);
            };

            const onMouseUp = () => {
                isResizing.current = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        [width]
    );

    return (
        <aside className={styles.sidebar} style={{ width }}>
            <div className={styles.content}>{children}</div>
            <div className={styles.resizeHandle} onMouseDown={handleMouseDown} />
        </aside>
    );
};

export default Sidebar;
