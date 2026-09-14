import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { commentService } from '../services/commentService';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem';
import '../styles/CommentSection.css';

const CommentSection = ({ postId, comments, onCommentAdded, onCommentDeleted }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await commentService.createComment(postId, commentText);
      toast.success('Comment added successfully');
      setCommentText('');
      onCommentAdded(response.data.comment);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      toast.success('Comment deleted successfully');
      onCommentDeleted(commentId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">
        Comments ({comments?.length || 0})
      </h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <textarea
            className="comment-input"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows="3"
            maxLength="1000"
          />
          <div className="comment-form-footer">
            <span className="comment-char-count">
              {commentText.length}/1000
            </span>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={submitting || !commentText.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <p>Please log in to comment</p>
        </div>
      )}

      <div className="comment-list">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="comment-empty">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;