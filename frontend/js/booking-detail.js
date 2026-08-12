// Shared helper: builds the "view booking" modal HTML from a joined booking object.
// Included by bookings-approved.html and bookings-cancelled.html
function bookingDetailHtml(b) {
  const statusText = b.Status === 'Approved' ? 'Your booking has been approved'
    : b.Status === 'Cancelled' ? 'Your booking has been cancelled'
    : 'Not Responded Yet';
  return `
    <table>
      <tr><th>Booking Number</th><td>${b.BookingID}</td><th>Client Name</th><td>${b.Name}</td></tr>
      <tr><th>Mobile Number</th><td>${b.MobileNumber}</td><th>Email</th><td>${b.Email}</td></tr>
      <tr><th>Event Date</th><td>${b.EventDate}</td><th>Event Start</th><td>${b.EventStartingtime}</td></tr>
      <tr><th>Event End</th><td>${b.EventEndingtime}</td><th>Venue Address</th><td>${b.VenueAddress}</td></tr>
      <tr><th>Event Type</th><td>${b.EventType}</td><th>Additional Info</th><td>${b.AdditionalInformation || ''}</td></tr>
      <tr><th>Service Name</th><td>${b.ServiceNames || ''}</td><th>Service Description</th><td>${b.ServiceDescriptions || ''}</td></tr>
      <tr><th>Service Price</th><td>₹${b.TotalServicePrice || 0}</td><th>Apply Date</th><td>${b.BookingDate}</td></tr>
      <tr><th>Order Final Status</th><td>${statusText}</td><th>Admin Remark</th><td>${b.Remark || 'Not Updated Yet'}</td></tr>
    </table>`;
}
