const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/reports/bookings
router.get('/bookings', requireAuth, async (req, res) => {
  try {
    const [bookings] = await pool.query('SELECT * FROM tblbooking ORDER BY ID DESC');
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load booking report.' });
  }
});

// GET /api/reports/events
router.get('/events', requireAuth, async (req, res) => {
  try {
    const [eventTypes] = await pool.query('SELECT * FROM tbleventtype ORDER BY ID DESC');
    res.json({ eventTypes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load event report.' });
  }
});

// GET /api/reports/between-dates?fdate=&tdate=
router.get('/between-dates', requireAuth, async (req, res) => {
  const { fdate, tdate } = req.query;
  try {
    let bookings;
    if (fdate && tdate) {
      [bookings] = await pool.query(
        'SELECT * FROM tblbooking WHERE DATE(BookingDate) BETWEEN ? AND ? ORDER BY ID DESC',
        [fdate, tdate]
      );
    } else {
      [bookings] = await pool.query('SELECT * FROM tblbooking ORDER BY ID DESC');
    }
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load report.' });
  }
});

module.exports = router;
