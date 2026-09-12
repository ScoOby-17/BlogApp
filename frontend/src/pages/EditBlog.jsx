import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import Loader from '../components/Loader';
import '../styles/EditBlog.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: 'tech',
    content: ''
  });
  const [currentCoverImage, setCurrentCoverImage] = useState('');
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await postService.getPostById(id);
      if (response.success) {
        const post = response.data.post;

        // Check ownership
        if (post.author._id !== user._id && user.role !== 'admin') {
          toast.error('You are not authorized to edit this post');
          navigate('/');
          return;
        }

        setFormData({
          title: post.title,
          category: post.category,
          content: post.content
        });
        setCurrentCoverImage(post.coverImage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch post');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Content is required');
      return;
    }

    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('content', formData.content);

      if (newCoverImage) {
        data.append('coverImage', newCoverImage);
      }

      const response = await postService.updatePost(id, data);

      if (response.success) {
        toast.success('Post updated successfully!');
        navigate(`/posts/${id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="edit-blog-page">
      <div className="container">
        <div className="edit-blog-header">
          <h1>Edit Post</h1>
          <p>Update your post content</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-blog-form">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter post title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="tech">Tech</option>
              <option value="food">Food</option>
              <option value="place">Place</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image</label>
            {!imagePreview && currentCoverImage && (
              <div className="current-image">
                <p className="current-image-label">Current image:</p>
                <img
                  src={`${API_BASE_URL}/uploads/${currentCoverImage}`}
                  alt="Current cover"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <p className="preview-label">New image preview:</p>
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/posts/${id}`)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
