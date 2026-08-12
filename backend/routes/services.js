const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireAdminRole } = require('../middleware/auth');

// GET /api/services -> any logged-in user (Admin or User) can view services
router.get('/', requireAuth, async (req, res) => {
  try {
    const [services] = await pool.query('SELECT * FROM tblservice ORDER BY ID DESC');
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load services.' });
  }
});

// POST /api/services -> create (Admin only)
router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const { servicename, servicedes, price } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO tblservice (ServiceName, SerDes, ServicePrice) VALUES (?, ?, ?)',
      [servicename, servicedes, price]
    );
    res.status(201).json({ message: 'Service added successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add service.' });
  }
});

// GET /api/services/:id -> any logged-in user can view a single service's detail
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tblservice WHERE ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Service not found.' });
    res.json({ service: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load service.' });
  }
});

// PUT /api/services/:id -> update (Admin only)
router.put('/:id', requireAuth, requireAdminRole, async (req, res) => {
  const { servicename, servicedes, price } = req.body;
  try {
    await pool.query(
      'UPDATE tblservice SET ServiceName = ?, SerDes = ?, ServicePrice = ? WHERE ID = ?',
      [servicename, servicedes, price, req.params.id]
    );
    res.json({ message: 'Service updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update service.' });
  }
});

// DELETE /api/services/:id (Admin only)
router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  try {
    await pool.query('DELETE FROM tblservice WHERE ID = ?', [req.params.id]);
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete service.' });
  }
});

module.exports = router;
