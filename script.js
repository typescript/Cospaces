const form = document.getElementById('booking-form');
const table = document.getElementById('bookings');

function loadBookings() {
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  table.innerHTML = '<tr><th>Name</th><th>Email</th><th>Room</th><th>Date</th><th>Start</th><th>End</th><th>Email</th></tr>';
  bookings.forEach((b, i) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${b.name}</td><td>${b.email}</td><td>${b.room}</td><td>${b.date}</td><td>${b.start}</td><td>${b.end}</td>`;
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${b.email}?subject=Booking%20Details&body=Room:%20${b.room}%0ADate:%20${b.date}%0AStart:%20${b.start}%0AEnd:%20${b.end}`;
    emailLink.textContent = 'Send';
    const cell = document.createElement('td');
    cell.appendChild(emailLink);
    row.appendChild(cell);
    table.appendChild(row);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const booking = {
    name: form.name.value,
    email: form.email.value,
    room: form.room.value,
    date: form.date.value,
    start: form.start.value,
    end: form.end.value
  };
  const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  form.reset();
  loadBookings();
});

window.addEventListener('load', loadBookings);
