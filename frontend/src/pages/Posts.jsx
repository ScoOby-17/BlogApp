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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = async (page = 1, limit = 9, cat = category, searchTerm = search) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(page, limit, cat, searchTerm);
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
    fetchPosts(1, 9, category, search);
  }, [category, search]);

  const handlePageChange = (page) => {
    fetchPosts(page, 9, category, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  return (
    <div className="posts-page">
      <div className="container">
        <div className="filters-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Search
            </button>
          </form>

          <CategoryFilter
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
          />
        </div>

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
            {search ? (
              <p>No posts found for '{search}'</p>
            ) : (
              <p>No posts found in this category.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;