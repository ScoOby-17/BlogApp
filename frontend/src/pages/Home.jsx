import { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import PostCard from '../components/PostCard';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLatestPosts = async () => {
    try {
      setLoading(true);
      const response = await postService.getPosts(1, 6, 'all'); // Get 6 latest posts
      if (response.success) {
        setLatestPosts(response.data.posts);
      }
    } catch (error) {
      toast.error('Failed to fetch latest posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  return (
    <div className="home">
      <div className="container">
        {/* Intro/About Section */}
        <section className="intro-section">
          <div className="intro-content">
            <div className="intro-logo">
              <span className="logo-icon"></span>
              <span className="logo-text">BlogApp</span>
            </div>
            <h1 className="intro-title">
              Discover <span className="intro-highlight">Amazing Stories</span>
            </h1>
            <p className="intro-text">
              A platform for sharing knowledge, experiences, and passions across
              technology, food, travel, and more. Join our community of writers
              and readers today.
            </p>
            <Link to="/posts" className="intro-button">
              Browse All Posts
            </Link>
          </div>
        </section>

        {/* Latest Posts Section */}
        <section className="latest-posts-section">
          <h2 className="section-title">Latest Posts</h2>

          {loading ? (
            <Loader />
          ) : latestPosts.length > 0 ? (
            <div className="posts-grid">
              {latestPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="no-posts">
              <p>No posts found.</p>
            </div>
          )}

          <div className="view-all-posts">
            <Link to="/posts" className="view-all-link">
              View all posts
              <span className="arrow">→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;