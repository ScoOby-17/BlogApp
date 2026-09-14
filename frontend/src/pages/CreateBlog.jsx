import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { postService } from '../services/postService';
import RichTextEditor from '../components/RichTextEditor';
import '../styles/CreateBlog.css';

const CreateBlog = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'tech',
    content: ''
  });
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

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
      setCoverImage(file);
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

    if (!coverImage) {
      toast.error('Cover image is required');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('category', formData.category);
      data.append('content', formData.content);
      data.append('coverImage', coverImage);

      const response = await postService.createPost(data);

      if (response.success) {
        toast.success('Post created successfully!');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog-page">
      <div className="container">
        <div className="create-blog-header">
          <h1>Create New Post</h1>
          <p>Share your thoughts with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="create-blog-form">
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
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-input"
              required
            />
            {imagePreview && (
              <div className="image-preview">
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
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;