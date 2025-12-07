import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLike from '../hooks/useLike';
import useSave from '../hooks/useSave';
import './PromptCard.css';

export default function PromptCard({ prompt, onUpdate }) {
  const { isLiked, likeCount, toggleLike } = useLike(prompt.id, prompt.like_count);
  const { isSaved, toggleSave } = useSave(prompt.id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="prompt-card card fade-in">
      <div className="prompt-header">
        <Link to={`/user/${prompt.owner.id}`} className="prompt-owner">
          {prompt.owner.avatar_url ? (
            <img src={prompt.owner.avatar_url} alt={prompt.owner.username} className="owner-avatar" />
          ) : (
            <div className="owner-avatar-placeholder">
              {prompt.owner.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="owner-name">{prompt.owner.username}</div>
            <div className="prompt-date">{new Date(prompt.created_at).toLocaleDateString()}</div>
          </div>
        </Link>
        {!prompt.is_public && <span className="private-badge">🔒 Private</span>}
      </div>

      <Link to={`/prompt/${prompt.id}`} className="prompt-content-link">
        <h3 className="prompt-title">{prompt.title}</h3>
        <p className="prompt-text">{prompt.text}</p>
      </Link>

      {prompt.tags && prompt.tags.length > 0 && (
        <div className="prompt-tags">
          {prompt.tags.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="prompt-actions">
        <button
          className={`action-btn ${isLiked ? 'active' : ''}`}
          onClick={toggleLike}
        >
          {isLiked ? '❤️' : '🤍'} {likeCount}
        </button>

        <Link to={`/prompt/${prompt.id}#comments`} className="action-btn">
          💬 {prompt.comment_count}
        </Link>

        <button
          className={`action-btn ${isSaved ? 'active' : ''}`}
          onClick={toggleSave}
        >
          {isSaved ? '🔖' : '📑'}
        </button>

        <button className="action-btn" onClick={handleCopy}>
          {copied ? '✅ Copied' : '📋 Copy'}
        </button>

        <div className="prompt-stats">
          👁️ {prompt.times_used} uses
        </div>
      </div>
    </article>
  );
}
