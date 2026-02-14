import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SEO from '../components/SEO';
import '../components/Navbar.css';
import './Blog.css';

export default function BlogList() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // Use a relative path assuming proxy or configured base URL, but api instance has baseURL
                const response = await api.get('/blog/posts/');
                // Check if response.data is pagination object or array
                setPosts(response.data.results || response.data);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <>
            <SEO
                title="Blog - PromptDeck"
                description="Read the latest articles, tutorials, and updates from the PromptDeck team."
            />

            <div className="blog-page">
                {/* Simple Navbar reusing Landing styles */}
                <nav className="landing-nav" style={{ backgroundColor: '#0a0a0a', borderBottom: '1px solid #333', position: 'fixed', width: '100%', top: 0, zIndex: 1000 }}>
                    <div className="nav-content">
                        <Link to="/" style={{ textDecoration: 'none', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>PromptDeck</Link>
                        <div className="nav-actions">
                            <Link to="/explore" className="btn-secondary" style={{ marginRight: '1rem' }}>Explore</Link>
                            <Link to="/login" className="btn-primary">Login</Link>
                        </div>
                    </div>
                </nav>

                <div className="blog-container">
                    <h1 className="blog-title">Latest Updates</h1>

                    {loading ? (
                        <div className="loading-spinner">Loading...</div>
                    ) : (
                        <div className="blog-grid">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <Link to={`/blog/${post.slug}`} key={post.id} className="blog-card">
                                        {post.image && (
                                            <div className="blog-image">
                                                <img src={post.image} alt={post.title} />
                                            </div>
                                        )}
                                        <div className="blog-content">
                                            <h2>{post.title}</h2>
                                            <p className="blog-date">{new Date(post.created_at).toLocaleDateString()}</p>
                                            <p className="blog-excerpt">{post.excerpt}</p>
                                            <span className="read-more">Read more →</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#888' }}>No posts found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
