// Renders the top navigation bar into <div id="navbar"></div> and wires up
// the logout button + role-based menu visibility. Plain DOM/JS, no framework.
async function renderNav() {
  const mount = document.getElementById('navbar');
  if (!mount) return;

  const user = Auth.getUser();
  const isAdmin = user && user.adminName === 'Admin';

  // Brand: show the uploaded company logo on the left if one exists,
  // otherwise fall back to the text brand name.
  let brandHtml = `<span class="nav-brand-text">The Food Bros Event</span>`;
  try {
    const { company } = await api.get('/company');
    if (company && company.companylogo) {
      const API_ORIGIN = API_BASE.replace('/api', '');
      brandHtml = `
        <img src="${API_ORIGIN}/uploads/logos/${company.companylogo}" alt="Logo" class="nav-logo"
             onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
        <span class="nav-brand-text" style="display:none;">The Food Bros Event</span>`;
    }
  } catch (e) {
    // Not logged in yet or request failed - just show the text brand.
  }

  mount.innerHTML = `
    <nav class="navbar-royal">
      <div class="nav-inner">
        <a class="nav-brand" href="dashboard.html">${brandHtml}</a>
        <button class="nav-toggle" id="navToggle">☰</button>
        <div class="nav-links" id="navLinks">
          <a href="dashboard.html">Dashboard</a>
          <a href="events.html">Manage Events</a>
          <a href="services.html">Manage Services</a>
          <div class="nav-dropdown">
            <a href="#" class="nav-drop-toggle">Bookings ▾</a>
            <div class="nav-dropdown-menu">
              <a href="bookings-new.html">New Bookings</a>
              <a href="bookings-approved.html">Approved Bookings</a>
              <a href="bookings-cancelled.html">Cancelled Bookings</a>
            </div>
          </div>
          <a href="billing.html">Billing</a>
          <a href="company.html">Company</a>
          ${isAdmin ? `
          <div class="nav-dropdown">
            <a href="#" class="nav-drop-toggle">Users ▾</a>
            <div class="nav-dropdown-menu">
              <a href="users.html">Manage Users</a>
              <a href="users-deleted.html">Blocked Users</a>
              <a href="users-permissions.html">User Roles</a>
            </div>
          </div>` : ''}
          <div class="nav-dropdown">
            <a href="#" class="nav-drop-toggle">Reports ▾</a>
            <div class="nav-dropdown-menu">
              <a href="reports-events.html">Events List</a>
              <a href="reports-bookings.html">Booking Report</a>
              <a href="reports-between-dates.html">Between Dates</a>
            </div>
          </div>
          <a href="contact.html">Contact Us</a>
          <a href="images.html">Images</a>
        </div>
        <div class="nav-dropdown nav-user">
          <a href="#" class="nav-drop-toggle">👤 ${user ? (user.fullName || user.userName) : ''} ▾</a>
          <div class="nav-dropdown-menu">
            <a href="profile.html">Profile</a>
            <a href="change-password.html">Change Password</a>
            <a href="#" id="logoutLink">Sign out</a>
          </div>
        </div>
      </div>
    </nav>
  `;

  document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    Auth.logout();
  });
  const toggle = document.getElementById('navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.getElementById('navLinks').classList.toggle('open');
    });
  }
}

document.addEventListener('DOMContentLoaded', renderNav);
