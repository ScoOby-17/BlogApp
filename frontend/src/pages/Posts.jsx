import { useState, useEffect } from 'react';
import { postService } from '../services/postService';
import PostList from '../components/PostList';
import CategoryFilter from '../components/CategoryFilter';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { toast } from 'react-toastify';
import '../styles/Posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('all');

  const fetchPosts = async (page = 1, limit = 9, cat = category) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(page, limit, cat);
      if (response.success) {
        setPosts(response.data.posts);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, 9, category);
  }, [category]);

  const handlePageChange = (page) => {
    fetchPosts(page, 9, category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
    fetchPosts(1, 9, cat);
  };

  return (
    <div className="posts-page">
      <div className="container">
        <CategoryFilter
          activeCategory={category}
          onCategoryChange={handleCategoryChange}
        />

        {loading ? (
          <Loader />
        ) : posts.length > 0 ? (
          <>
            <PostList posts={posts} />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <div className="no-posts">
            <p>No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;
