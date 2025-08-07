// client/src/components/Post/CommentCard.js
import React from 'react';
import { Link } from 'react-router-dom';

const CommentCard = ({ comment }) => {
  return (
    <div className="comment-card" style={{
      backgroundColor: '#f9f9f9',
      border: '1px solid #eee',
      borderRadius: '6px',
      padding: '10px',
      marginBottom: '10px'
    }}>
      <div className="comment-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' }}>
          <span>{comment.username.charAt(0).toUpperCase()}</span>
        </div>
        <Link to={`/profile/${comment.user_id}`} style={{ fontWeight: 'bold', marginLeft: '8px', textDecoration: 'none', color: '#333' }}>
          {comment.username}
        </Link>
        <span style={{ fontSize: '12px', color: '#888', marginLeft: 'auto' }}>
          {new Date(comment.created_at).toLocaleString()}
        </span>
      </div>
      <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.4' }}>{comment.content}</p>
    </div>
  );
};

export default CommentCard;