// Shared password field helpers, used on every page with a password input:
// index.html (login), forgot-password.html, change-password.html, users.html (Add User).
//
// Two problems this fixes:
// 1. No way to see the password you're typing -> adds a show/hide eye toggle.
// 2. Native HTML5 validation tooltips get visually clipped inside scrollable
//    modal boxes (.modal-box { overflow-y: auto }), so an invalid password
//    silently refuses to submit with no visible feedback. This replaces that
//    with a real inline error message that always renders in-flow.

const EYE_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>`;

// Same rule as backend/middleware/validators.js -> isValidPassword
function isValidPasswordClient(value) {
  return typeof value === 'string' && /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value);
}

// Wraps every not-yet-wrapped password input inside `root` with a show/hide
// toggle button. Safe to call repeatedly (e.g. after a modal re-renders).
function initPasswordToggles(root = document) {
  root.querySelectorAll('input[type="password"]:not([data-pw-wrapped])').forEach((input) => {
    input.setAttribute('data-pw-wrapped', '1');

    const wrap = document.createElement('div');
    wrap.className = 'password-wrap';
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(input);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pw-toggle-btn';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = EYE_ICON;
    wrap.appendChild(btn);

    btn.addEventListener('click', () => {
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.innerHTML = showing ? EYE_ICON : EYE_OFF_ICON;
      btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
  });
}

// Attaches live + on-submit validation to a password input, with a visible
// inline message instead of relying on the native (and easily clipped)
// browser validation bubble. Returns a function that checks validity now
// and returns true/false — call it from the form's submit handler.
function attachPasswordValidation(input, message = 'Password must be at least 6 characters and include a letter and a number.') {
  const error = document.createElement('small');
  error.className = 'field-error';
  error.style.display = 'none';
  error.textContent = message;
  // Insert after the password-wrap if toggles already ran, else after the input itself.
  const after = input.closest('.password-wrap') || input;
  after.parentNode.insertBefore(error, after.nextSibling);

  function check() {
    const ok = isValidPasswordClient(input.value);
    error.style.display = ok ? 'none' : 'block';
    input.classList.toggle('field-invalid', !ok);
    return ok;
  }

  input.addEventListener('input', () => {
    if (error.style.display === 'block') check(); // live-clear once they fix it
  });
  input.addEventListener('blur', check);

  return check;
}
