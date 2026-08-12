const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { requireAuth, SECRET } = require('../middleware/auth');
const { isValidEmail, isValidPassword } = require('../middleware/validators');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM tbladmin WHERE UserName = ? LIMIT 1', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid Details' });
    }
    const admin = rows[0];
    const match = await bcrypt.compare(password || '', admin.Password || '');
    if (!match) {
      return res.status(401).json({ error: 'Invalid Details' });
    }
    if (String(admin.Status) !== '1') {
      return res.status(403).json({ error: 'Your account was disabled. Approach Admin.' });
    }

    const payload = {
      id: admin.ID,
      userName: admin.UserName,
      adminName: admin.AdminName,
      fullName: `${admin.FirstName || ''} ${admin.LastName || ''}`.trim()
    };
    const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });

    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/auth/me -> whoami, used by the frontend to restore session on page load
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email, mobile, newpassword } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!isValidPassword(newpassword)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters and include a letter and a number.' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT ID FROM tbladmin WHERE Email = ? AND MobileNumber = ? LIMIT 1',
      [email, mobile]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account matches that email and mobile number.' });
    }
    const hash = await bcrypt.hash(newpassword, 10);
    await pool.query('UPDATE tbladmin SET Password = ? WHERE ID = ?', [hash, rows[0].ID]);
    res.json({ message: 'Password updated successfully. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
