import React from 'react';
import ReactDOM from 'react-dom';
import { QRCodeSVG } from "qrcode.react";
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, shareUrl }) => {
    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        // Could show toast here or change button text temporarily
    };

    return ReactDOM.createPortal(
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
                <div className="share-header">
                    <h3>Share Prompt</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="share-body">
                    <div className="cool-qr-wrapper">
                        <div className="qr-glow"></div>
                        <div className="qr-code-container">
                            {/* Define the Gradient */}
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="qr-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            <QRCodeSVG
                                value={shareUrl}
                                size={250}
                                level="Q"
                                includeMargin={false}
                                bgColor="transparent"
                                fgColor="url(#qr-gradient)"
                                imageSettings={{
                                    src: "/logo192.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 48,
                                    width: 48,
                                    excavate: true,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="share-link-box">
                    <input type="text" readOnly value={shareUrl} className="share-input" />
                    <button className="share-copy-btn" onClick={handleCopy}>Copy</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ShareModal;
