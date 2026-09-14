import PostCard from './PostCard';
import '../styles/PostList.css';

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="post-list-empty">
        <div className="post-list-empty-icon"></div>
        <h3>No posts found</h3>
        <p>There are no posts to display right now.</p>
      </div>
    );
  }

  return (
    <div className="post-list-grid">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostList;