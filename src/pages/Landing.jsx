import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import './Landing.css';

export default function Landing() {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const fullText = 'The professional platform for prompt engineers. Save your best prompts, discover trending ones, and collaborate with the community.';

    useEffect(() => {
        let index = isDeleting ? fullText.length : 0;

        const timer = setInterval(() => {
            if (!isDeleting) {
                // Typing
                if (index <= fullText.length) {
                    setDisplayText(fullText.slice(0, index));
                    index++;
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), 2000);
                    clearInterval(timer);
                }
            } else {
                // Deleting
                if (index >= 0) {
                    setDisplayText(fullText.slice(0, index));
                    index--;
                } else {
                    setIsDeleting(false);
                    clearInterval(timer);
                }
            }
        }, isDeleting ? 20 : 50); // Slower typing (50ms), faster deleting (20ms)

        return () => clearInterval(timer);
    }, [isDeleting]);

    return (
        <>
            <SEO
                title="Home"
                description="Store, share, and discover AI prompts. Join the community of prompt engineers."
            />

            <div className="landing-page">
                <nav className="landing-nav">
                    <div className="nav-content">
                        <h1>CommandVault</h1>
                        <div className="nav-actions">
                            <Link to="/login" className="btn-secondary">Login</Link>
                            <Link to="/register" className="btn-primary">Get Started</Link>
                        </div>
                    </div>
                </nav>

                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Store & Share Your <span className="accent">AI Prompts</span>
                        </h1>
                        <p className="hero-description">
                            {displayText}<span className="cursor">|</span>
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn-large btn-primary">
                                Start Free
                            </Link>
                            <Link to="/login" className="btn-large btn-secondary">
                                Sign In
                            </Link>
                        </div>
                    </div>

                    <div className="hero-stats">
                        <div className="stat-card">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Prompts Shared</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">5K+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">AI Models</div>
                        </div>
                    </div>
                </section>

                <section className="features-section">
                    <h2>Why CommandVault?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <h3>Secure Storage</h3>
                            <p>Keep your prompts safe with public/private options</p>
                        </div>
                        <div className="feature-card">
                            <h3>Trending Prompts</h3>
                            <p>Discover what's working for the community</p>
                        </div>
                        <div className="feature-card">
                            <h3>Social Features</h3>
                            <p>Like, comment, and save your favorite prompts</p>
                        </div>
                        <div className="feature-card">
                            <h3>Multi-Model Support</h3>
                            <p>Works with ChatGPT, Claude, Gemini, and more</p>
                        </div>
                    </div>
                </section>

                <footer className="landing-footer">
                    <div className="footer-content">
                        <p>© 2024 CommandVault. Built for prompt engineers.</p>
                        <div className="social-links">
                            <a href="https://github.com/ganesh-rajput-07" target="_blank" rel="noopener noreferrer" className="social-link">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub
                            </a>
                            <a href="https://www.linkedin.com/in/ganeshrajput7045/" target="_blank" rel="noopener noreferrer" className="social-link">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
