const bookingSelect = document.querySelector("#bookingSelect");
const paymentBookingSummary = document.querySelector("#paymentBookingSummary");
const paymentMethod = document.querySelector("#paymentMethod");
const payerName = document.querySelector("#payerName");
const paymentAmount = document.querySelector("#paymentAmount");
const paymentMessage = document.querySelector("#paymentMessage");
const paymentForm = document.querySelector("#paymentForm");
const latestPaymentSummary = document.querySelector("#latestPaymentSummary");
const paymentHistory = document.querySelector("#paymentHistory");

const servicePrices = {
  Plumber: 299,
  Electrician: 299,
  Carpenter: 399,
  Painter: 999,
  "AC Repair": 499,
  Cleaning: 399,
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function normalizeBookingPrice(booking) {
  const amount = Number(booking.price) || 0;
  return amount < 100 ? servicePrices[booking.service] || amount : amount;
}

function formatDateTime(value) {
  return value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
}

function showToast(message, type = "success") {
  const container = document.querySelector("#toastContainer");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

function getBookings() {
  return JSON.parse(localStorage.getItem("homefixBookings") || "[]");
}

function setBookings(bookings) {
  localStorage.setItem("homefixBookings", JSON.stringify(bookings));
}

function getPayments() {
  return JSON.parse(localStorage.getItem("homefixPayments") || "[]");
}

function setPayments(payments) {
  localStorage.setItem("homefixPayments", JSON.stringify(payments));
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function addNotification(title, message, type = "Payment") {
  const notifications = getNotifications();
  notifications.push({
    id: `NTF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem("homefixNotifications", JSON.stringify(notifications));
}

function getSelectedBooking() {
  return getBookings().find((booking) => booking.id === bookingSelect.value);
}

function renderBookingOptions() {
  const bookings = getBookings();
  const pendingBookings = bookings.filter((booking) => booking.status !== "Cancelled" && booking.paymentStatus !== "Paid");
  const selectedId = new URLSearchParams(window.location.search).get("booking");

  if (!pendingBookings.length) {
    bookingSelect.innerHTML = '<option value="">No pending payments</option>';
    bookingSelect.disabled = true;
    paymentForm.querySelector("button[type='submit']").disabled = true;
    renderBookingSummary();
    return;
  }

  bookingSelect.disabled = false;
  paymentForm.querySelector("button[type='submit']").disabled = false;
  bookingSelect.innerHTML = pendingBookings
    .map(
      (booking) =>
        `<option value="${escapeHtml(booking.id)}">${escapeHtml(booking.id)} - ${escapeHtml(booking.service)} - ${escapeHtml(formatPrice(normalizeBookingPrice(booking)))}</option>`
    )
    .join("");

  if (selectedId && pendingBookings.some((booking) => booking.id === selectedId)) {
    bookingSelect.value = selectedId;
  }

  renderBookingSummary();
}

function renderBookingSummary() {
  const booking = getSelectedBooking();

  if (!booking) {
    paymentBookingSummary.innerHTML = '<p class="empty-row">No pending booking selected.</p>';
    paymentAmount.textContent = formatPrice(0);
    return;
  }

  paymentAmount.textContent = formatPrice(normalizeBookingPrice(booking));
  paymentBookingSummary.innerHTML = `
    <div class="summary-item"><span>Booking ID</span><strong>${escapeHtml(booking.id)}</strong></div>
    <div class="summary-item"><span>Service</span><strong>${escapeHtml(booking.service)}</strong></div>
    <div class="summary-item"><span>Worker</span><strong>${escapeHtml(booking.assignedWorker?.name || "Not assigned")}</strong></div>
    <div class="summary-item"><span>Status</span><strong>${escapeHtml(booking.status || "Confirmed")}</strong></div>
  `;
}

function renderLatestPayment(payment) {
  const latest = payment || getPayments().at(-1);

  if (!latest) {
    latestPaymentSummary.innerHTML = '<div><dt>Status</dt><dd>No payment made yet.</dd></div>';
    return;
  }

  latestPaymentSummary.innerHTML = `
    <div><dt>Payment ID</dt><dd>${escapeHtml(latest.id)}</dd></div>
    <div><dt>Booking ID</dt><dd>${escapeHtml(latest.bookingId)}</dd></div>
    <div><dt>Amount</dt><dd>${escapeHtml(formatPrice(latest.amount))}</dd></div>
    <div><dt>Method</dt><dd>${escapeHtml(latest.method)}</dd></div>
    <div><dt>Status</dt><dd>${escapeHtml(latest.status)}</dd></div>
    <div><dt>Date</dt><dd>${escapeHtml(formatDateTime(latest.createdAt))}</dd></div>
  `;
}

function renderPaymentHistory() {
  const payments = getPayments().slice().reverse();

  if (!payments.length) {
    paymentHistory.innerHTML = '<tr><td class="empty-row" colspan="7">No payments found.</td></tr>';
    return;
  }

  paymentHistory.innerHTML = payments
    .map(
      (payment) => `
        <tr>
          <td>${escapeHtml(payment.id)}</td>
          <td>${escapeHtml(payment.bookingId)}</td>
          <td>${escapeHtml(payment.service)}</td>
          <td>${escapeHtml(formatPrice(payment.amount))}</td>
          <td>${escapeHtml(payment.method)}</td>
          <td>${escapeHtml(formatDateTime(payment.createdAt))}</td>
          <td>${escapeHtml(payment.status)}</td>
        </tr>
      `
    )
    .join("");
}

bookingSelect.addEventListener("change", renderBookingSummary);

paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const booking = getSelectedBooking();

  if (!booking) {
    paymentMessage.textContent = "No pending booking selected.";
    showToast("No pending booking selected.", "error");
    return;
  }

  if (!payerName.value.trim()) {
    paymentMessage.textContent = "Please enter payer name.";
    showToast("Please enter payer name.", "error");
    payerName.focus();
    return;
  }

  const payment = {
    id: `PAY-${Date.now().toString().slice(-8)}`,
    bookingId: booking.id,
    service: booking.service,
    amount: normalizeBookingPrice(booking),
    method: paymentMethod.value,
    payerName: payerName.value.trim(),
    status: "Paid",
    createdAt: new Date().toISOString(),
  };

  setPayments([...getPayments(), payment]);

  const bookings = getBookings().map((item) =>
    item.id === booking.id
      ? {
          ...item,
          paymentStatus: "Paid",
          paymentId: payment.id,
        }
      : item
  );
  setBookings(bookings);
  localStorage.setItem("homefixLastBooking", JSON.stringify(bookings.find((item) => item.id === booking.id) || booking));
  addNotification("Payment successful", `${formatPrice(payment.amount)} paid for booking ${payment.bookingId}.`, "Payment");

  paymentMessage.textContent = `Payment successful. Payment ID: ${payment.id}`;
  showToast("Payment successful.");
  payerName.value = "";
  renderBookingOptions();
  renderLatestPayment(payment);
  renderPaymentHistory();
});

renderBookingOptions();
renderLatestPayment();
renderPaymentHistory();
