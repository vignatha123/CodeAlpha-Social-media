// server/routes/posts.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware

// @route   POST api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, (req, res) => {
    const db = req.db;
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    if (!content) {
        return res.status(400).json({ msg: 'Post content is required' });
    }

    db.run(
        'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
        [userId, content, imageUrl || null],
        function (err) {
            if (err) {
                console.error('Error creating post:', err.message);
                return res.status(500).send('Server Error');
            }
            res.status(201).json({
                msg: 'Post created successfully',
                post: { id: this.lastID, user_id: userId, content, image_url: imageUrl }
            });
        }
    );
});

// @route   GET api/posts
// @desc    Get all posts (e.g., for a feed)
// @access  Public
router.get('/', (req, res) => {
    const db = req.db;
    // Fetch posts with associated user data and like count
    db.all(`
        SELECT
            p.id,
            p.content,
            p.image_url,
            p.created_at,
            u.id AS user_id,
            u.username,
            u.profile_picture,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
    `, (err, posts) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            return res.status(500).send('Server Error');
        }
        res.json(posts);
    });
});

// @route   GET api/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', (req, res) => {
    const db = req.db;
    const postId = req.params.id;

    db.get(`
        SELECT
            p.id,
            p.content,
            p.image_url,
            p.created_at,
            u.id AS user_id,
            u.username,
            u.profile_picture,
            (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `, [postId], (err, post) => {
        if (err) {
            console.error('Error fetching post:', err.message);
            return res.status(500).send('Server Error');
        }
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json(post);
    });
});

// @route   PUT api/posts/:id
// @desc    Update a post
// @access  Private (only owner can update)
router.put('/:id', auth, (req, res) => {
    const db = req.db;
    const postId = req.params.id;
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) return res.status(500).send('Server Error');
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        if (post.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to update this post' });
        }

        db.run(
            'UPDATE posts SET content = ?, image_url = ? WHERE id = ?',
            [content || post.content, imageUrl || post.image_url, postId],
            function (err) {
                if (err) {
                    console.error('Error updating post:', err.message);
                    return res.status(500).send('Server Error');
                }
                res.json({ msg: 'Post updated successfully', changes: this.changes });
            }
        );
    });
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private (only owner can delete)
router.delete('/:id', auth, (req, res) => {
    const db = req.db;
    const postId = req.params.id;
    const userId = req.user.id;

    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) return res.status(500).send('Server Error');
        if (!post) return res.status(404).json({ msg: 'Post not found' });
        if (post.user_id !== userId) {
            return res.status(403).json({ msg: 'Not authorized to delete this post' });
        }

        db.run('DELETE FROM posts WHERE id = ?', [postId], function (err) {
            if (err) {
                console.error('Error deleting post:', err.message);
                return res.status(500).send('Server Error');
            }
            if (this.changes === 0) {
                return res.status(404).json({ msg: 'Post not found (or already deleted)' });
            }
            res.json({ msg: 'Post deleted successfully' });
        });
    });
});

// @route   POST api/posts/like/:id
// @desc    Like a post
// @access  Private
router.post('/like/:id', auth, (req, res) => {
    const db = req.db;
    const postId = req.params.id;
    const userId = req.user.id;

    db.run(
        'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId],
        function (err) {
            if (err) {
                if (err.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
                    return res.status(400).json({ msg: 'You have already liked this post' });
                }
                console.error('Error liking post:', err.message);
                return res.status(500).send('Server Error');
            }
            res.json({ msg: 'Post liked successfully' });
        }
    );
});

// @route   DELETE api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.delete('/unlike/:id', auth, (req, res) => {
    const db = req.db;
    const postId = req.params.id;
    const userId = req.user.id;

    db.run(
        'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId],
        function (err) {
            if (err) {
                console.error('Error unliking post:', err.message);
                return res.status(500).send('Server Error');
            }
            if (this.changes === 0) {
                return res.status(400).json({ msg: 'You have not liked this post' });
            }
            res.json({ msg: 'Post unliked successfully' });
        }
    );
});

module.exports = router;