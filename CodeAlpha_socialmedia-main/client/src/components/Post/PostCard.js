// client/src/components/Post/PostCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PostCard = ({ post, isAuthenticated, currentUser, onLikeToggle }) => {
  const token = localStorage.getItem('token');

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to like posts.');
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/posts/like/${post.id}`, {}, {
        headers: { 'x-auth-token': token }
      });
      onLikeToggle(post.id, true); // Notify parent to update like count
    } catch (err) {
      console.error('Error liking post:', err.response ? err.response.data : err.message);
      alert(err.response ? err.response.data.msg : 'Error liking post');
    }
  };

  const handleUnlike = async () => {
    if (!isAuthenticated) {
      alert('Please log in to unlike posts.');
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/posts/unlike/${post.id}`, {
        headers: { 'x-auth-token': token }
      });
      onLikeToggle(post.id, false); // Notify parent to update like count
    } catch (err) {
      console.error('Error unliking post:', err.response ? err.response.data : err.message);
      alert(err.response ? err.response.data.msg : 'Error unliking post');
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        {/* Placeholder for profile picture */}
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span>{post.username.charAt(0).toUpperCase()}</span>
        </div>
        <Link to={`/profile/${post.user_id}`} className="username">
          {post.username}
        </Link>
      </div>
      <p className="post-content">{post.content}</p>
      {post.image_url && (
        <div className="post-image">
          <img src={post.image_url} alt="Post" />
        </div>
      )}
      <div className="post-actions">
        {isAuthenticated && (
          // You'd ideally check if the current user has liked this post
          // This simplified version allows multiple likes unless backend prevents
          <>
            <button onClick={handleLike}>Like</button>
            <button onClick={handleUnlike}>Unlike</button>
          </>
        )}
        <span>{post.likes_count} Likes</span>
        <Link to={`/post/${post.id}`}>Comments</Link>
      </div>
    </div>
  );
};

export default PostCard;