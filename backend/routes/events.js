const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth, requireAdminRole } = require('../middleware/auth');

// GET /api/events -> any logged-in user (Admin or User) can view event types
router.get('/', requireAuth, async (req, res) => {
  try {
    const [eventTypes] = await pool.query('SELECT * FROM tbleventtype ORDER BY ID DESC');
    res.json({ eventTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load event types.' });
  }
});

// POST /api/events -> create (Admin only)
router.post('/', requireAuth, requireAdminRole, async (req, res) => {
  const { event } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO tbleventtype (EventType) VALUES (?)', [event]);
    res.status(201).json({ message: 'Event type added successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add event type.' });
  }
});

// DELETE /api/events/:id (Admin only)
router.delete('/:id', requireAuth, requireAdminRole, async (req, res) => {
  try {
    await pool.query('DELETE FROM tbleventtype WHERE ID = ?', [req.params.id]);
    res.json({ message: 'Event type deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete event type.' });
  }
});

module.exports = router;
