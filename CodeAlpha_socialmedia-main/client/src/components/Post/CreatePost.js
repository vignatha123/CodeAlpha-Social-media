// client/src/components/Post/CreatePost.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreatePost = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:5000/api/posts',
        { content, imageUrl: imageUrl.trim() || null },
        {
          headers: { 'x-auth-token': token },
        }
      );
      setSuccess('Post created successfully!');
      setContent('');
      setImageUrl('');
      navigate('/'); // Redirect to home page after successful post
    } catch (err) {
      console.error('Error creating post:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.msg : 'Failed to create post.');
    }
  };

  return (
    <div className="create-post-form">
      <h2>Create New Post</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="5"
            placeholder="Write your post here..."
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional):</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="e.g., https://example.com/image.jpg"
          />
        </div>
        <button type="submit" className="btn">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;