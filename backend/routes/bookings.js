const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { isValidMobile, isValidEmail } = require('../middleware/validators');

// GET /api/bookings/new -> pending bookings
router.get('/new', requireAuth, async (req, res) => {
  try {
    const [bookings] = await pool.query('SELECT * FROM tblbooking WHERE Status IS NULL ORDER BY ID DESC');
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bookings.' });
  }
});

// GET /api/bookings/approved
router.get('/approved', requireAuth, async (req, res) => {
  try {
    const [bookings] = await pool.query("SELECT * FROM tblbooking WHERE Status = 'Approved' ORDER BY ID DESC");
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load approved bookings.' });
  }
});

// GET /api/bookings/cancelled
router.get('/cancelled', requireAuth, async (req, res) => {
  try {
    const [bookings] = await pool.query("SELECT * FROM tblbooking WHERE Status = 'Cancelled' ORDER BY ID DESC");
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load cancelled bookings.' });
  }
});

// POST /api/bookings -> create a new booking
router.post('/', requireAuth, async (req, res) => {
  const { serviceid, name, contact, email, eventdate, est, eetime, address, eventtype, info } = req.body;

  if (!isValidMobile(contact)) {
    return res.status(400).json({ error: 'Mobile number must be exactly 10 digits.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    const bookingId = Math.floor(100000000 + Math.random() * 899999999);
    const [result] = await pool.query(
      `INSERT INTO tblbooking
        (BookingID, ServiceID, Name, MobileNumber, Email, EventDate, EventStartingtime,
         EventEndingtime, VenueAddress, EventType, AdditionalInformation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, serviceid, name, contact, email, eventdate, est, eetime, address, eventtype, info]
    );
    res.status(201).json({ message: 'Booking Request Has Been Added.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/bookings/:id -> full joined detail (view modal + invoice use this)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tblbooking.*,
              GROUP_CONCAT(tblservice.ServiceName SEPARATOR ', ') AS ServiceNames,
              GROUP_CONCAT(tblservice.SerDes SEPARATOR ' | ') AS ServiceDescriptions,
              SUM(tblservice.ServicePrice) AS TotalServicePrice
       FROM tblbooking
       LEFT JOIN tblservice ON FIND_IN_SET(tblservice.ID, tblbooking.ServiceID)
       WHERE tblbooking.ID = ?
       GROUP BY tblbooking.ID`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ booking: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load booking details.' });
  }
});

// POST /api/bookings/:id/action -> approve/cancel a booking
router.post('/:id/action', requireAuth, async (req, res) => {
  const { status, remark } = req.body;
  try {
    await pool.query('UPDATE tblbooking SET Status = ?, Remark = ? WHERE ID = ?', [status, remark, req.params.id]);
    res.json({ message: 'Booking updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update. Try again later.' });
  }
});

module.exports = router;
