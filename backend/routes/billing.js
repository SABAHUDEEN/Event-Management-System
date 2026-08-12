const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/billing -> all bills, with the linked booking's customer name
router.get('/', requireAuth, async (req, res) => {
  try {
    const [bills] = await pool.query(
      `SELECT tblbilling.*, tblbooking.BookingID AS BookingRefID, tblbooking.Name AS CustomerName,
              tblbooking.MobileNumber, tblbooking.Email
       FROM tblbilling
       JOIN tblbooking ON tblbilling.BookingID = tblbooking.ID
       ORDER BY tblbilling.ID DESC`
    );
    res.json({ bills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bills.' });
  }
});

// GET /api/billing/eligible-bookings -> approved bookings that don't have a bill yet
router.get('/eligible-bookings', requireAuth, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT tblbooking.ID, tblbooking.BookingID, tblbooking.Name,
              GROUP_CONCAT(tblservice.ServiceName SEPARATOR ', ') AS ServiceNames,
              SUM(tblservice.ServicePrice) AS TotalServicePrice
       FROM tblbooking
       LEFT JOIN tblservice ON FIND_IN_SET(tblservice.ID, tblbooking.ServiceID)
       WHERE tblbooking.Status = 'Approved'
         AND tblbooking.ID NOT IN (SELECT BookingID FROM tblbilling)
       GROUP BY tblbooking.ID
       ORDER BY tblbooking.ID DESC`
    );
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bookings eligible for billing.' });
  }
});

// GET /api/billing/:id -> single bill with full booking + service details, for viewing/printing
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tblbilling.*, tblbooking.BookingID AS BookingRefID, tblbooking.Name AS CustomerName,
              tblbooking.MobileNumber, tblbooking.Email, tblbooking.EventDate, tblbooking.VenueAddress,
              GROUP_CONCAT(tblservice.ServiceName SEPARATOR ', ') AS ServiceNames,
              GROUP_CONCAT(tblservice.SerDes SEPARATOR ' | ') AS ServiceDescriptions
       FROM tblbilling
       JOIN tblbooking ON tblbilling.BookingID = tblbooking.ID
       LEFT JOIN tblservice ON FIND_IN_SET(tblservice.ID, tblbooking.ServiceID)
       WHERE tblbilling.ID = ?
       GROUP BY tblbilling.ID`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Bill not found.' });
    res.json({ bill: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load bill.' });
  }
});

// POST /api/billing -> raise a new bill for an approved booking
router.post('/', requireAuth, async (req, res) => {
  const { bookingId, amount, taxPercent, discount, paymentMode, notes } = req.body;

  const amt = Number(amount) || 0;
  const tax = Number(taxPercent) || 0;
  const disc = Number(discount) || 0;

  if (!bookingId || amt <= 0) {
    return res.status(400).json({ error: 'Please choose a booking and enter a valid amount.' });
  }

  const totalAmount = amt + (amt * tax / 100) - disc;

  try {
    const [existing] = await pool.query('SELECT ID FROM tblbilling WHERE BookingID = ?', [bookingId]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'A bill already exists for this booking.' });
    }

    const billNo = 'BILL-' + Date.now().toString().slice(-8);
    const [result] = await pool.query(
      `INSERT INTO tblbilling (BillNo, BookingID, Amount, TaxPercent, Discount, TotalAmount, PaymentMode, Notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [billNo, bookingId, amt, tax, disc, totalAmount, paymentMode || null, notes || null]
    );
    res.status(201).json({ message: 'Bill created successfully.', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create bill.' });
  }
});

// POST /api/billing/:id/status -> mark Paid / Unpaid / Partially Paid
router.post('/:id/status', requireAuth, async (req, res) => {
  const { paymentStatus, paymentMode } = req.body;
  const allowed = ['Unpaid', 'Paid', 'Partially Paid'];
  if (!allowed.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Invalid payment status.' });
  }
  try {
    await pool.query(
      'UPDATE tblbilling SET PaymentStatus = ?, PaymentMode = ? WHERE ID = ?',
      [paymentStatus, paymentMode || null, req.params.id]
    );
    res.json({ message: 'Bill status updated.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update bill status.' });
  }
});

// DELETE /api/billing/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tblbilling WHERE ID = ?', [req.params.id]);
    res.json({ message: 'Bill deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete bill.' });
  }
});

module.exports = router;
