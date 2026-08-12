// Small shared validators used across routes so the API never trusts
// client-side HTML5 validation alone.

function isValidMobile(value) {
  return typeof value === 'string' && /^[0-9]{10}$/.test(value.trim());
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// At least 6 characters, containing at least one letter and one number.
function isValidPassword(value) {
  return typeof value === 'string' && /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);
}

module.exports = { isValidMobile, isValidEmail, isValidPassword };
