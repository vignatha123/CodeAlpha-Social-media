// client/src/components/Profile/Profile.js
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../Post/PostCard';

const Profile = ({ isAuthenticated, currentUser }) => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileRes = await axios.get(`http://localhost:5000/api/users/${userId}`);
      setProfile(profileRes.data);

      // const postsRes = await axios.get(`http://localhost:5000/api/posts?userId=${userId}`); // Removed unused postsRes
      const allPostsRes = await axios.get('http://localhost:5000/api/posts');
      setUserPosts(allPostsRes.data.filter(post => post.user_id === parseInt(userId)));


      if (isAuthenticated && currentUser && currentUser.id !== parseInt(userId)) {
        const followingRes = await axios.get(`http://localhost:5000/api/users/${currentUser.id}/following`);
        setIsFollowing(followingRes.data.some(f => f.id === parseInt(userId)));
      } else {
        setIsFollowing(false);
      }

    } catch (err) {
      console.error('Error fetching profile:', err.response ? err.response.data : err.message);
      setError(err.response ? err.response.data.msg : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId, isAuthenticated, currentUser]);


  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      alert('Please log in to follow users.');
      return;
    }
    try {
      if (isFollowing) {
        await axios.delete(`http://localhost:5000/api/users/unfollow/${userId}`, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(false);
      } else {
        await axios.post(`http://localhost:5000/api/users/follow/${userId}`, {}, {
          headers: { 'x-auth-token': token }
        });
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Error following/unfollowing:', err.response ? err.response.data : err.message);
      alert(err.response ? err.response.data.msg : 'Action failed');
    }
  };

  const handleLikeToggle = useCallback((postId, isLiked) => {
    setUserPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes_count: post.likes_count + (isLiked ? 1 : -1) }
          : post
      )
    );
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <div>Profile not found.</div>;

  const isOwnProfile = isAuthenticated && currentUser && currentUser.id === parseInt(userId);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>{profile.username}'s Profile</h2>
        {profile.profile_picture && <img src={profile.profile_picture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />}
        <p className="bio">{profile.bio || 'No bio available.'}</p>
        {!isOwnProfile && isAuthenticated && (
          <button onClick={handleFollowToggle} className="btn follow-button">
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div className="profile-posts">
        <h3>Posts</h3>
        {userPosts.length === 0 ? (
          <p>{profile.username} has no posts yet.</p>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;