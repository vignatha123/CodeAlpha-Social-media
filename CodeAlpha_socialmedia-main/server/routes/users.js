// server/routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', (req, res) => {
    const db = req.db;
    const userId = req.params.id;

    db.get('SELECT id, username, email, profile_picture, bio, created_at FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            console.error('Error fetching user:', err.message);
            return res.status(500).send('Server Error');
        }
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    });
});

// @route   POST api/users/follow/:id
// @desc    Follow a user
// @access  Private
router.post('/follow/:id', auth, (req, res) => {
    const db = req.db;
    const followerId = req.user.id; // The authenticated user
    const followingId = req.params.id; // The user to follow

    if (followerId === parseInt(followingId)) {
        return res.status(400).json({ msg: 'You cannot follow yourself' });
    }

    db.run(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId],
        function (err) {
            if (err) {
                if (err.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
                    return res.status(400).json({ msg: 'Already following this user' });
                }
                console.error('Error following user:', err.message);
                return res.status(500).send('Server Error');
            }
            res.json({ msg: 'User followed successfully' });
        }
    );
});

// @route   DELETE api/users/unfollow/:id
// @desc    Unfollow a user
// @access  Private
router.delete('/unfollow/:id', auth, (req, res) => {
    const db = req.db;
    const followerId = req.user.id;
    const followingId = req.params.id;

    db.run(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId],
        function (err) {
            if (err) {
                console.error('Error unfollowing user:', err.message);
                return res.status(500).send('Server Error');
            }
            if (this.changes === 0) {
                return res.status(400).json({ msg: 'You are not following this user' });
            }
            res.json({ msg: 'User unfollowed successfully' });
        }
    );
});

// @route   GET api/users/:id/followers
// @desc    Get followers of a user
// @access  Public
router.get('/:id/followers', (req, res) => {
    const db = req.db;
    const userId = req.params.id;

    db.all(`
        SELECT u.id, u.username, u.profile_picture
        FROM users u
        JOIN followers f ON u.id = f.follower_id
        WHERE f.following_id = ?
    `, [userId], (err, followers) => {
        if (err) {
            console.error('Error fetching followers:', err.message);
            return res.status(500).send('Server Error');
        }
        res.json(followers);
    });
});

// @route   GET api/users/:id/following
// @desc    Get users a user is following
// @access  Public
router.get('/:id/following', (req, res) => {
    const db = req.db;
    const userId = req.params.id;

    db.all(`
        SELECT u.id, u.username, u.profile_picture
        FROM users u
        JOIN followers f ON u.id = f.following_id
        WHERE f.follower_id = ?
    `, [userId], (err, following) => {
        if (err) {
            console.error('Error fetching following:', err.message);
            return res.status(500).send('Server Error');
        }
        res.json(following);
    });
});


module.exports = router;