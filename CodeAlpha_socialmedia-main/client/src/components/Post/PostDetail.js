// client/src/components/Post/PostDetail.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Removed Link
import axios from 'axios';
import PostCard from './PostCard';
import CommentCard from './CommentCard';

const PostDetail = ({ isAuthenticated, currentUser }) => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchPostAndComments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const postRes = await axios.get(`http://localhost:5000/api/posts/${postId}`);
      setPost(postRes.data);

      const commentsRes = await axios.get(`http://localhost:5000/api/comments/${postId}`);
      setComments(commentsRes.data);
    } catch (err) {
      console.error('Error fetching post/comments:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.msg : 'Failed to load post details.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchPostAndComments();
  }, [fetchPostAndComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to comment.');
      return;
    }
    if (!newComment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/api/comments/${postId}`, { content: newComment }, {
        headers: { 'x-auth-token': token }
      });
      setComments(prevComments => [...prevComments, { ...res.data.comment, username: currentUser.username, profile_picture: null }]);
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err.response ? err.response.data : err.message);
      alert(err.response ? err.response.data.msg : 'Failed to add comment.');
    }
  };

  const handlePostLikeToggle = useCallback((postId, isLiked) => {
    if (post && post.id === postId) {
      setPost(prevPost => ({
        ...prevPost,
        likes_count: prevPost.likes_count + (isLiked ? 1 : -1)
      }));
    }
  }, [post]);


  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div>
      <h2>Post Detail</h2>
      <PostCard
        post={post}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLikeToggle={handlePostLikeToggle}
      />

      <div className="comments-section" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Comments ({comments.length})</h3>
        {isAuthenticated && (
          <form onSubmit={handleAddComment} style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
              ></textarea>
            </div>
            <button type="submit" className="btn">Add Comment</button>
          </form>
        )}

        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;