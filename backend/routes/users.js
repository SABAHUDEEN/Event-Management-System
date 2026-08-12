const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { requireAuth, requireAdminRole } = require('../middleware/auth');
const { isValidMobile, isValidEmail, isValidPassword } = require('../middleware/validators');

// GET /api/users -> active staff/admins
router.get('/', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM tbladmin WHERE Status = '1' ORDER BY ID DESC");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load users.' });
  }
});

// GET /api/users/deleted -> blocked users (must be before /:id routes)
router.get('/deleted', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const [users] = await pool.query("SELECT * FROM tbladmin WHERE Status = '0' ORDER BY ID DESC");
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load blocked users.' });
  }
});

// POST /api/users -> create new staff/admin user
router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const { staffid, dignity, username, firstname, lastname, email, mobile, password } = req.body;

  if (!isValidMobile(mobile)) {
    return res.status(400).json({ error: 'Mobile number must be exactly 10 digits.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!isValidPassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters and include a letter and a number.' });
  }

  try {
    const [existing] = await pool.query('SELECT ID FROM tbladmin WHERE UserName = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO tbladmin (Staffid, AdminName, UserName, FirstName, LastName, Email, MobileNumber, Password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [staffid, dignity, username, firstname, lastname, email, mobile, hash]
    );
    res.status(201).json({ message: 'User created successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create user.' });
  }
});

// GET /api/users/:id
router.get('/:id', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbladmin WHERE ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load user.' });
  }
});

// PUT /api/users/:id -> update
router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const { username, firstname, lastname, mobile, email } = req.body;

  if (!isValidMobile(mobile)) {
    return res.status(400).json({ error: 'Mobile number must be exactly 10 digits.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    await pool.query(
      `UPDATE tbladmin SET UserName = ?, FirstName = ?, LastName = ?, MobileNumber = ?, Email = ? WHERE ID = ?`,
      [username, firstname, lastname, mobile, email, req.params.id]
    );
    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update user.' });
  }
});

// POST /api/users/:id/block
router.post('/:id/block', requireAuth, requireAdminRole, async (req, res) => {
  try {
    await pool.query("UPDATE tbladmin SET Status = '0' WHERE ID = ?", [req.params.id]);
    res.json({ message: 'User blocked.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not block user.' });
  }
});

// POST /api/users/:id/restore
router.post('/:id/restore', requireAuth, requireAdminRole, async (req, res) => {
  try {
    await pool.query("UPDATE tbladmin SET Status = '1' WHERE ID = ?", [req.params.id]);
    res.json({ message: 'User restored.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not restore user.' });
  }
});

module.exports = router;
