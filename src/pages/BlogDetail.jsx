import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import SEO from '../components/SEO';
import './Blog.css';
import './Landing.css';

export default function BlogDetail() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await api.get(`/blog/posts/${slug}/`);
                setPost(response.data);
            } catch (error) {
                console.error("Error fetching blog post:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) return (
        <div className="blog-page">
            <div className="loader-container" style={{ paddingTop: '100px' }}>
                <div className="spinner"></div>
            </div>
        </div>
    );

    // Helper for Consistent Nav
    const BlogNav = () => (
        <nav className="landing-nav" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', borderBottom: '1px solid #1f1f1f', position: 'fixed', width: '100%', top: 0, zIndex: 1000 }}>
            <div className="nav-content">
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1>PromptDeck</h1>
                </Link>
                <div className="nav-actions">
                    <Link to="/blog" className="btn-secondary">Back to Blog</Link>
                </div>
            </div>
        </nav>
    );

    if (!post) {
        return (
            <div className="blog-page">
                <BlogNav />
                <div className="blog-container">Post not found</div>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={post.meta_title || post.title}
                description={post.meta_description || post.excerpt}
                image={post.image}
                url={`/blog/${post.slug}`}
            />

            <div className="blog-page">
                <BlogNav />

                <article className="blog-article">
                    <header className="article-header">
                        <h1>{post.title}</h1>
                        <div className="article-meta">
                            <span>By {post.author_username}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        {post.image && (
                            <div className="article-image">
                                <img src={post.image} alt={post.title} />
                            </div>
                        )}
                    </header>

                    <div className="article-content">
                        {/* Handling newlines or markdown? For now assume plain text or simple HTML */}
                        {post.content.split('\n').map((para, i) => (
                            <p key={i}>{para}</p>
                        ))}
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                        <Link to="/blog" className="btn-secondary">← Back to Blog</Link>
                    </div>
                </article>
            </div>
        </>
    );
}
