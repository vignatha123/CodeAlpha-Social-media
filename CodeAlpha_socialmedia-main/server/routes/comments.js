// server/routes/comments.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware

// @route   POST api/comments/:post_id
// @desc    Add a comment to a post
// @access  Private
router.post('/:post_id', auth, (req, res) => {
    const db = req.db;
    const postId = req.params.post_id;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
        return res.status(400).json({ msg: 'Comment content is required' });
    }

    db.run(
        'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
        [postId, userId, content],
        function (err) {
            if (err) {
                console.error('Error adding comment:', err.message);
                return res.status(500).send('Server Error');
            }
            res.status(201).json({
                msg: 'Comment added successfully',
                comment: { id: this.lastID, post_id: postId, user_id: userId, content }
            });
        }
    );
});

// @route   GET api/comments/:post_id
// @desc    Get comments for a specific post
// @access  Public
router.get('/:post_id', (req, res) => {
    const db = req.db;
    const postId = req.params.post_id;

    db.all(`
        SELECT
            c.id,
            c.content,
            c.created_at,
            u.id AS user_id,
            u.username,
            u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `, [postId], (err, comments) => {
        if (err) {
            console.error('Error fetching comments:', err.message);
            return res.status(500).send('Server Error');
        }
        res.json(comments);
    });
});

// @route   PUT api/comments/:id
// @desc    Update a comment
// @access  Private (only owner can update)
router.put('/:id', auth, (req, res) => {
    const db = req.db;
    const commentId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;

    db.get('SELECT user_id FROM comments WHERE id = ?', [commentId], (err, comment) => {
        if (err) return res.status(500).send('Server Error');
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });
        if (comment.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to update this comment' });
        }

        db.run(
            'UPDATE comments SET content = ? WHERE id = ?',
            [content, commentId],
            function (err) {
                if (err) {
                    console.error('Error updating comment:', err.message);
                    return res.status(500).send('Server Error');
                }
                res.json({ msg: 'Comment updated successfully', changes: this.changes });
            }
        );
    });
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private (only owner can delete)
router.delete('/:id', auth, (req, res) => {
    const db = req.db;
    const commentId = req.params.id;
    const userId = req.user.id;

    db.get('SELECT user_id FROM comments WHERE id = ?', [commentId], (err, comment) => {
        if (err) return res.status(500).send('Server Error');
        if (!comment) return res.status(404).json({ msg: 'Comment not found' });
        if (comment.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this comment' });
        }

        db.run('DELETE FROM comments WHERE id = ?', [commentId], function (err) {
            if (err) {
                console.error('Error deleting comment:', err.message);
                return res.status(500).send('Server Error');
            }
            if (this.changes === 0) {
                return res.status(404).json({ msg: 'Comment not found (or already deleted)' });
            }
            res.json({ msg: 'Comment deleted successfully' });
        });
    });
});

module.exports = router;