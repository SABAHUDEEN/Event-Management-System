const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// GET /api/contact -> company info for the contact page
router.get('/contact', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tblcompany LIMIT 1');
    res.json({ company: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load contact info.' });
  }
});

// GET /api/images -> logo + staff photos, for the images gallery page
router.get('/images', requireAuth, async (req, res) => {
  try {
    const [companyRows] = await pool.query('SELECT companylogo FROM tblcompany LIMIT 1');
    const [admins] = await pool.query('SELECT ID, FirstName, LastName, Photo FROM tbladmin');
    res.json({ company: companyRows[0] || null, admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load images.' });
  }
});

// POST /api/check-availability -> username/email/company-name uniqueness check
router.post('/check-availability', async (req, res) => {
  const { emailid, companyname, fullname } = req.body;
  try {
    if (emailid) {
      const [rows] = await pool.query('SELECT Email FROM tbladmin WHERE Email = ?', [emailid]);
      return res.json({ available: rows.length === 0, field: 'email' });
    }
    if (companyname) {
      const [rows] = await pool.query('SELECT companyname FROM tblcompany WHERE companyname = ?', [companyname]);
      return res.json({ available: rows.length === 0, field: 'companyname' });
    }
    if (fullname) {
      const [rows] = await pool.query('SELECT UserName FROM tbladmin WHERE UserName = ?', [fullname]);
      return res.json({ available: rows.length === 0, field: 'username' });
    }
    res.json({ available: null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not check availability.' });
  }
});

module.exports = router;
