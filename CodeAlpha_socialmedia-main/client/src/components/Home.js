// client/src/components/Home.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import PostCard from './Post/PostCard';

const Home = ({ isAuthenticated, user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err.response ? err.response.data : err.message);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLikeToggle = useCallback((postId, isLiked) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes_count: post.likes_count + (isLiked ? 1 : -1) }
          : post
      )
    );
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h1>Welcome to the Social App!</h1>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to create one!</p>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isAuthenticated={isAuthenticated}
            currentUser={user}
            onLikeToggle={handleLikeToggle}
          />
        ))
      )}
    </div>
  );
};

export default Home;