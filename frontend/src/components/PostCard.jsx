import { Link } from 'react-router-dom';
import '../styles/PostCard.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Strip HTML tags and truncate to create an excerpt
const createExcerpt = (htmlContent, maxLength = 120) => {
  const text = htmlContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '…';
};

const PostCard = ({ post }) => {
  const {
    _id,
    title,
    coverImage,
    content,
    category,
    author,
    likesCount = 0,
    commentsCount = 0,
    createdAt
  } = post;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Link to={`/posts/${_id}`} className="post-card">
      <div className="post-card-image">
        <img
          src={`${API_BASE_URL}/uploads/${coverImage}`}
          alt={title}
          loading="lazy"
        />
        <span className={`badge badge-${category} post-card-badge`}>
          {category}
        </span>
      </div>

      <div className="post-card-body">
        <h3 className="post-card-title">{title}</h3>
        <p className="post-card-excerpt">{createExcerpt(content)}</p>

        <div className="post-card-meta">
          <div className="post-card-author">
            <div className="post-card-avatar">
              {author?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="post-card-author-info">
              <span className="post-card-author-name">{author?.name}</span>
              <span className="post-card-date">{formattedDate}</span>
            </div>
          </div>

          <div className="post-card-stats">
            <span className="post-card-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {likesCount}
            </span>
            <span className="post-card-stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {commentsCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;