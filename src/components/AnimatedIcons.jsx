import { useState, useEffect } from 'react';
import './AnimatedIcons.css';

export function HeartIcon({ isLiked, onClick, size = 20 }) {
    const [animating, setAnimating] = useState(false);
    const [showBreak, setShowBreak] = useState(false);

    const handleClick = (e) => {
        if (e) e.stopPropagation();
        setAnimating(true);
        if (isLiked) {
            setShowBreak(true);
            setTimeout(() => setShowBreak(false), 600);
        }
        setTimeout(() => setAnimating(false), 600);
        if (onClick) onClick(e);
    };

    return (
        <div className="icon-wrapper" onClick={handleClick}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={`heart-icon ${isLiked ? 'liked' : ''} ${animating ? 'animating' : ''} ${showBreak ? 'breaking' : ''}`}
            >
                <defs>
                    <linearGradient id="waterGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>
                </defs>

                {/* Heart outline */}
                <path
                    className="heart-outline"
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                />

                {/* Water fill */}
                {isLiked && (
                    <path
                        className="heart-fill"
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        fill="url(#waterGradient)"
                    />
                )}
            </svg>
        </div>
    );
}

export function BookmarkIcon({ isSaved, onClick, size = 20 }) {
    const [animating, setAnimating] = useState(false);

    const handleClick = (e) => {
        if (e) e.stopPropagation();
        setAnimating(true);
        setTimeout(() => setAnimating(false), 800);
        if (onClick) onClick(e);
    };

    return (
        <div className="icon-wrapper" onClick={handleClick}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={`bookmark-icon ${isSaved ? 'saved' : ''} ${animating ? 'animating' : ''}`}
            >
                <defs>
                    <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>

                {/* Bookmark outline */}
                <path
                    className="bookmark-outline"
                    d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                    fill={isSaved ? 'url(#ribbonGradient)' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                />

                {/* Pencil animation path */}
                {animating && !isSaved && (
                    <path
                        className="pencil-line"
                        d="M8 10 L16 10 M8 13 L14 13"
                        stroke="#8b5cf6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                )}
            </svg>
        </div>
    );
}

export function EyeIcon({ isViewing, size = 20 }) {
    const [blinking, setBlinking] = useState(false);

    useEffect(() => {
        if (isViewing) {
            setBlinking(true);
            const timer = setTimeout(() => setBlinking(false), 400);
            return () => clearTimeout(timer);
        }
    }, [isViewing]);

    return (
        <div className="icon-wrapper">
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={`eye-icon ${isViewing ? 'viewed' : ''} ${blinking ? 'blinking' : ''}`}
            >
                <defs>
                    <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                </defs>
                {/* Eye outline */}
                <path
                    className="eye-outline"
                    d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                    fill={isViewing ? 'url(#eyeGradient)' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                />

                {/* Pupil */}
                <circle
                    className="eye-pupil"
                    cx="12"
                    cy="12"
                    r="3"
                    fill={isViewing ? '#ffffff' : 'currentColor'}
                />

                {/* Eyelid for blink */}
                {blinking && (
                    <path
                        className="eyelid"
                        d="M1 12s4-8 11-8 11 8 11 8"
                        fill="#000000"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                )}
            </svg>
        </div>
    );
}
