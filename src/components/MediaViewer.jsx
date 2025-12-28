import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './MediaViewer.css';

const MediaViewer = ({ media, type, title, onClose, text }) => {
    const [copied, setCopied] = useState(false);

    React.useEffect(() => {
        document.body.classList.add('modal-open');
        return () => document.body.classList.remove('modal-open');
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(text || media);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!media && !text) return null;

    const modalContent = (
        <div className="media-viewer-overlay" onClick={onClose}>
            <div className="media-viewer-content" onClick={e => e.stopPropagation()}>
                <button className="viewer-close" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </button>

                <div className="viewer-header">
                    <h3>{title}</h3>
                    {(type === 'code' || type === 'text') && (
                        <button className={`viewer-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                        </button>
                    )}
                </div>

                <div className="viewer-body">
                    {type === 'image' && (
                        <div className="viewer-image-container">
                            <img src={media} alt={title} />
                        </div>
                    )}
                    {type === 'video' && (
                        <div className="viewer-video-container">
                            <video controls autoPlay src={media} />
                        </div>
                    )}
                    {(type === 'code' || type === 'text') && (
                        <div className="viewer-text-container">
                            <pre className={type === 'code' ? 'code-block' : 'text-block'}>
                                <code>{text || media}</code>
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default MediaViewer;
