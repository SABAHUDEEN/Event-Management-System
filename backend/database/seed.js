// Usage: node database/seed.js "myNewPassword"
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function main() {
  const password = process.argv[2] || 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Bcrypt hash for "%s":\n%s\n', password, hash);
  try {
    const [result] = await pool.query("UPDATE tbladmin SET Password = ? WHERE UserName = 'admin'", [hash]);
    console.log(result.affectedRows > 0
      ? 'Default admin user password updated in the database.'
      : 'No user with UserName="admin" found - hash printed above only.');
  } catch (err) {
    console.log('Could not connect to the database. Paste the hash above into tbladmin.Password manually.');
    console.log('Error:', err.message);
  }
  process.exit(0);
}

main();
