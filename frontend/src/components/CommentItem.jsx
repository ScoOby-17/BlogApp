import { useAuth } from '../context/AuthContext';
import '../styles/CommentItem.css';

const CommentItem = ({ comment, onDelete }) => {
  const { user } = useAuth();

  const { _id, text, author, createdAt } = comment;
  const isOwner = user && user._id === author._id;
  const isAdmin = user && user.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-author">
          <div className="comment-avatar">
            {author?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="comment-meta">
            <span className="comment-author-name">{author?.name || 'Unknown User'}</span>
            <span className="comment-date">{formattedDate}</span>
          </div>
        </div>

        {canDelete && (
          <button
            className="comment-delete-btn"
            onClick={() => onDelete(_id)}
            title="Delete comment"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
            </svg>
          </button>
        )}
      </div>

      <div className="comment-body">
        <p className="comment-text">{text}</p>
      </div>
    </div>
  );
};

export default CommentItem;