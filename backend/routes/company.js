const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/logos')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// GET /api/company
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tblcompany LIMIT 1');
    res.json({ company: rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load company profile.' });
  }
});

// PUT /api/company -> update details
router.put('/', requireAuth, async (req, res) => {
  const { companyname, companyemail, regno, mobilenumber, companyaddress } = req.body;
  try {
    await pool.query(
      `UPDATE tblcompany SET companyaddress = ?, companyemail = ?, regno = ?, companyphone = ?, companyname = ?`,
      [companyaddress, companyemail, regno, mobilenumber, companyname]
    );
    res.json({ message: 'Company profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update company profile.' });
  }
});

// POST /api/company/logo -> multipart upload
router.post('/logo', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please choose a logo file to upload.' });
    await pool.query('UPDATE tblcompany SET companylogo = ?', [req.file.filename]);
    res.json({ message: 'Company logo updated successfully.', filename: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update logo.' });
  }
});

module.exports = router;
