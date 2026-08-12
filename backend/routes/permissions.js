const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireAdminRole } = require('../middleware/auth');

// GET /api/permissions
router.get('/', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const [permissions] = await pool.query('SELECT * FROM permissions ORDER BY id');
    res.json({ permissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load permissions.' });
  }
});

// GET /api/permissions/:id
router.get('/:id', requireAuth, requireAdminRole, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM permissions WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Role not found.' });
    res.json({ permission: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load role.' });
  }
});

// PUT /api/permissions/:id -> update capability flags
router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const { createuser, deleteuser, createbid, updatebid } = req.body;
  try {
    await pool.query(
      `UPDATE permissions SET createuser = ?, deleteuser = ?, createbid = ?, updatebid = ? WHERE id = ?`,
      [createuser, deleteuser, createbid, updatebid, req.params.id]
    );
    res.json({ message: 'Permissions updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update permissions.' });
  }
});

module.exports = router;
