const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const [[{ totalnewbooking }]] = await pool.query(
      'SELECT COUNT(*) AS totalnewbooking FROM tblbooking WHERE Status IS NULL'
    );
    const [[{ totalappbooking }]] = await pool.query(
      "SELECT COUNT(*) AS totalappbooking FROM tblbooking WHERE Status = 'Approved'"
    );
    const [[{ totalcanbooking }]] = await pool.query(
      "SELECT COUNT(*) AS totalcanbooking FROM tblbooking WHERE Status = 'Cancelled'"
    );
    const [[{ totalserv }]] = await pool.query('SELECT COUNT(*) AS totalserv FROM tblservice');
    const [approvedBookings] = await pool.query(
      "SELECT * FROM tblbooking WHERE Status = 'Approved' ORDER BY ID DESC"
    );

    res.json({
      totalnewbooking,
      totalappbooking,
      totalcanbooking,
      totalserv,
      approvedBookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load dashboard data.' });
  }
});

module.exports = router;
