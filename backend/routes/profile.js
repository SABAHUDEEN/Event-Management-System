const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { isValidMobile, isValidEmail, isValidPassword } = require('../middleware/validators');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/profiles')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET /api/profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbladmin WHERE ID = ?', [req.user.id]);
    res.json({ admin: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile.' });
  }
});

// PUT /api/profile -> update own profile
router.put('/', requireAuth, async (req, res) => {
  const { adminname, firstname, lastname, mobilenumber, email } = req.body;

  if (!isValidMobile(mobilenumber)) {
    return res.status(400).json({ error: 'Mobile number must be exactly 10 digits.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    await pool.query(
      `UPDATE tbladmin SET UserName = ?, FirstName = ?, LastName = ?, MobileNumber = ?, Email = ? WHERE ID = ?`,
      [adminname, firstname, lastname, mobilenumber, email, req.user.id]
    );
    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

// POST /api/profile/photo
router.post('/photo', requireAuth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please choose an image to upload.' });
    await pool.query('UPDATE tbladmin SET Photo = ? WHERE ID = ?', [req.file.filename, req.user.id]);
    res.json({ message: 'Profile image updated successfully.', filename: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update photo.' });
  }
});

// POST /api/profile/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  const { currentpassword, newpassword, confirmpassword } = req.body;
  try {
    if (newpassword !== confirmpassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }
    if (!isValidPassword(newpassword)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters and include a letter and a number.' });
    }
    const [rows] = await pool.query('SELECT Password FROM tbladmin WHERE ID = ?', [req.user.id]);
    const admin = rows[0];
    const match = admin && await bcrypt.compare(currentpassword, admin.Password || '');
    if (!match) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }
    const hash = await bcrypt.hash(newpassword, 10);
    await pool.query('UPDATE tbladmin SET Password = ? WHERE ID = ?', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not change password.' });
  }
});

module.exports = router;
