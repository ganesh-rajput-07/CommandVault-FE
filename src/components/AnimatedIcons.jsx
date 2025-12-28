import { useState, useEffect } from 'react';
import './AnimatedIcons.css';

export function HeartIcon({ isLiked, onClick, size = 20 }) {
    const [animating, setAnimating] = useState(false);

    const handleClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (animating) return;

        setAnimating(true);
        setTimeout(() => setAnimating(false), 500); // Animation duration
        if (onClick) onClick(e);
    };

    return (
        <div className={`icon-wrapper heart-wrapper ${isLiked ? 'active' : ''}`} onClick={handleClick}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={`heart-icon ${isLiked ? 'liked' : ''} ${animating ? 'animating' : ''}`}
                fill={isLiked ? "currentColor" : "none"}
            >
                <path
                    className="heart-outline"
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <div className={`heart-burst ${animating && isLiked ? 'bursting' : ''}`}>
                <span className="particle p1"></span>
                <span className="particle p2"></span>
                <span className="particle p3"></span>
                <span className="particle p4"></span>
                <span className="particle p5"></span>
                <span className="particle p6"></span>
            </div>
        </div>
    );
}

export function BookmarkIcon({ isSaved, onClick, size = 20 }) {
    const [animating, setAnimating] = useState(false);

    const handleClick = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (animating) return;

        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);
        if (onClick) onClick(e);
    };

    return (
        <div className={`icon-wrapper bookmark-wrapper ${isSaved ? 'active' : ''}`} onClick={handleClick}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                className={`bookmark-icon ${isSaved ? 'saved' : ''} ${animating ? 'animating' : ''}`}
                fill={isSaved ? "currentColor" : "none"}
            >
                <path
                    className="bookmark-outline"
                    d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
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
