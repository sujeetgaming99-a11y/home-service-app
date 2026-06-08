const bookingForm = document.querySelector("#bookingForm");
const serviceInput = document.querySelector("#service");
const dateInput = document.querySelector("#date");
const timeInput = document.querySelector("#time");
const addressInput = document.querySelector("#address");
const phoneInput = document.querySelector("#phone");
const descriptionInput = document.querySelector("#description");
const estimatedPrice = document.querySelector("#estimatedPrice");
const successMessage = document.querySelector("#successMessage");
const summary = document.querySelector("#bookingSummary");
const summaryPanel = document.querySelector("#summaryPanel");
const bookingsList = document.querySelector("#bookingsList");
const summaryTimeSelect = document.querySelector("#summaryTimeSelect");
const saveSummaryTime = document.querySelector("#saveSummaryTime");

let currentSummaryBookingId = "";

const servicePrices = {
  Plumber: 299,
  Electrician: 299,
  Carpenter: 399,
  Painter: 999,
  "AC Repair": 499,
  Cleaning: 399,
  "Appliance Repair": 499,
  "Home Maintenance": 599,
};

const defaultWorkers = [
  { id: "worker-plumber", name: "Rahul Sharma", service: "Plumber", phone: "+911234567890", experience: "8 years", rating: 4.9, price: 299 },
  { id: "worker-electrician", name: "Amit Verma", service: "Electrician", phone: "+911234567891", experience: "6 years", rating: 4.8, price: 299 },
  { id: "worker-carpenter", name: "Karan Mehta", service: "Carpenter", phone: "+911234567892", experience: "7 years", rating: 4.7, price: 399 },
  { id: "worker-painter", name: "Neha Singh", service: "Painter", phone: "+911234567893", experience: "5 years", rating: 4.8, price: 999 },
  { id: "worker-ac", name: "Sameer Khan", service: "AC Repair", phone: "+911234567894", experience: "9 years", rating: 4.9, price: 499 },
  { id: "worker-cleaning", name: "Priya Nair", service: "Cleaning", phone: "+911234567895", experience: "4 years", rating: 4.9, price: 399 },
  { id: "worker-appliance", name: "Arjun Rao", service: "Appliance Repair", phone: "+911234567896", experience: "6 years", rating: 4.8, price: 499 },
  { id: "worker-maintenance", name: "Meera Iyer", service: "Home Maintenance", phone: "+911234567897", experience: "10 years", rating: 4.9, price: 599 },
];

function formatPrice(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function normalizeBookingPrice(booking) {
  const amount = Number(booking.price) || 0;
  return amount < 100 ? servicePrices[booking.service] || amount : amount;
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

function getTodayValue() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

function getPrice() {
  return servicePrices[serviceInput.value] || 0;
}

function updatePrice() {
  estimatedPrice.textContent = formatPrice(getPrice());
}

function createBookingId() {
  return `HF-${Date.now().toString().slice(-8)}`;
}

function getCustomerName() {
  const savedProfile = JSON.parse(localStorage.getItem("homefixUserProfile") || "null");

  if (savedProfile?.name) {
    return savedProfile.name;
  }

  const users = JSON.parse(localStorage.getItem("homefixUsers") || "[]");
  const latestUser = users[users.length - 1];

  return latestUser?.name || "HomeFix Customer";
}

function getAssignedWorkerName(booking) {
  if (typeof booking.assignedWorker === "string") {
    return booking.assignedWorker || "Not assigned";
  }

  return booking.assignedWorker?.name || "Not assigned";
}

function formatCreatedTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBookings() {
  return JSON.parse(localStorage.getItem("homefixBookings") || "[]");
}

function setBookings(bookings) {
  localStorage.setItem("homefixBookings", JSON.stringify(bookings));
}

function getWorkers() {
  const saved = JSON.parse(localStorage.getItem("homefixWorkers") || "[]");

  if (saved.length) {
    return saved;
  }

  localStorage.setItem("homefixWorkers", JSON.stringify(defaultWorkers));
  return defaultWorkers;
}

function assignWorker(service) {
  const worker = getWorkers().find((item) => item.service === service || item.skill === service) || defaultWorkers.find((item) => item.service === service);

  return worker
    ? {
        id: worker.id,
        name: worker.name,
        phone: worker.phone,
        service: worker.service || worker.skill || service,
        rating: worker.rating,
        price: normalizeBookingPrice({ service, price: worker.price }),
      }
    : {
        id: "worker-homefix",
        name: "HomeFix Expert",
        phone: "+911234567899",
        service,
        rating: 4.7,
        price: getPrice(),
      };
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function addNotification(title, message, type = "Booking") {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setError(input, message) {
  const field = input.closest(".field");
  const errorMessage = field.querySelector(".error-message");

  field.classList.toggle("invalid", Boolean(message));
  errorMessage.textContent = message;
}

function validateField(input) {
  const value = input.value.trim();

  if (!value) {
    return "This field is required.";
  }

  if (input === phoneInput && !/^\d{10}$/.test(value.replace(/\D/g, ""))) {
    return "Enter a valid 10 digit phone number.";
  }

  if (input === dateInput && value < dateInput.min) {
    return "Select today or a future date.";
  }

  if (input === descriptionInput && value.length < 10) {
    return "Describe the problem in at least 10 characters.";
  }

  return "";
}

function validateForm() {
  const inputs = [serviceInput, dateInput, timeInput, phoneInput, addressInput, descriptionInput];
  let isValid = true;

  inputs.forEach((input) => {
    const error = validateField(input);
    setError(input, error);

    if (error) {
      isValid = false;
    }
  });

  return isValid;
}

function renderSummary(booking) {
  currentSummaryBookingId = booking.id || "";
  const values = {
    service: booking.service,
    date: booking.date,
    time: booking.time,
    phone: booking.phone,
    address: booking.address,
    description: booking.problemDescription || booking.description,
    price: formatPrice(normalizeBookingPrice(booking)),
    status: booking.status || "Pending",
    paymentStatus: booking.paymentStatus || "Pending",
    assignedWorker: getAssignedWorkerName(booking),
    id: booking.id,
    createdAt: formatCreatedTime(booking.createdAt),
  };

  summary.querySelectorAll("[data-summary]").forEach((item) => {
    item.textContent = values[item.dataset.summary] || "-";
  });

  summaryPanel.classList.remove("is-hidden");

  if (summaryTimeSelect && booking.time) {
    summaryTimeSelect.value = booking.time;
  }
}

function updateBookingTime(bookingId, nextTime) {
  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return {
      ...booking,
      time: nextTime,
      updatedAt: new Date().toISOString(),
    };
  });

  setBookings(bookings);

  const updatedBooking = bookings.find((booking) => booking.id === bookingId);
  if (updatedBooking) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(updatedBooking));
    renderSummary(updatedBooking);
  }

  renderBookings();
  showToast("Booking time updated.");
}

function createDetail(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function renderBookings() {
  const bookings = getBookings();

  if (!bookings.length) {
    bookingsList.innerHTML = '<p class="empty-bookings">No bookings yet. Confirm a booking to see it here.</p>';
    return;
  }

  bookingsList.innerHTML = bookings
    .slice()
    .reverse()
    .map((booking) => {
      const status = booking.status || "Pending";
      const isCancelled = status === "Cancelled";

      return `
        <article class="booking-card">
          <div class="booking-card-header">
            <h3>${escapeHtml(booking.service || "Service booking")}</h3>
            <span class="status-badge${isCancelled ? " cancelled" : ""}">${escapeHtml(status)}</span>
          </div>
          <dl class="booking-details">
            ${createDetail("Service", booking.service)}
            ${createDetail("Date", booking.date)}
            ${createDetail("Time", booking.time)}
            ${createDetail("Address", booking.address)}
            ${createDetail("Phone", booking.phone)}
            ${createDetail("Problem", booking.problemDescription || booking.description)}
            ${createDetail("Estimated Price", booking.price ? formatPrice(normalizeBookingPrice(booking)) : "-")}
            ${createDetail("Status", status)}
            ${createDetail("Worker Response", booking.workerResponse || "Waiting")}
            ${createDetail("Payment", booking.paymentStatus || "Pending")}
            ${createDetail("Worker", getAssignedWorkerName(booking))}
            ${createDetail("Booking ID", booking.id)}
            ${createDetail("Created time", formatCreatedTime(booking.createdAt))}
          </dl>
          <div class="time-editor">
            <label for="time-${escapeHtml(booking.id)}">Edit Time</label>
            <select id="time-${escapeHtml(booking.id)}" data-time-select="${escapeHtml(booking.id)}">
              ${["Next 30 minutes", "09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "05:00 PM", "07:00 PM"]
                .map((item) => `<option ${item === booking.time ? "selected" : ""}>${item}</option>`)
                .join("")}
            </select>
            <button type="button" data-edit-time="${escapeHtml(booking.id)}">Save Time</button>
          </div>
          <button class="cancel-button" type="button" data-cancel-id="${escapeHtml(booking.id)}" ${isCancelled ? "disabled" : ""}>
            ${isCancelled ? "Booking Cancelled" : "Cancel Booking"}
          </button>
        </article>
      `;
    })
    .join("");
}

function saveBooking(booking) {
  const bookings = getBookings();
  bookings.push(booking);
  setBookings(bookings);
  localStorage.setItem("homefixLastBooking", JSON.stringify(booking));
}

function loadLastBooking() {
  const savedBooking = localStorage.getItem("homefixLastBooking");

  if (!savedBooking) {
    return;
  }

  renderSummary(JSON.parse(savedBooking));
}

function applyQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get("service");
  const address = params.get("address");
  const time = params.get("time");

  if (service && servicePrices[service]) {
    serviceInput.value = service;
  }

  if (address) {
    addressInput.value = address;
  }

  if (time && Array.from(timeInput.options).some((option) => option.value === time)) {
    timeInput.value = time;
  }

  updatePrice();
}

dateInput.min = getTodayValue();
updatePrice();
loadLastBooking();
renderBookings();
applyQueryParams();

serviceInput.addEventListener("change", updatePrice);

[serviceInput, dateInput, timeInput, addressInput, phoneInput, descriptionInput].forEach((input) => {
  input.addEventListener("input", () => {
    setError(input, "");
    successMessage.textContent = "";
  });
});

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    successMessage.textContent = "";
    showToast("Please complete all booking fields.", "error");
    return;
  }

  const booking = {
    id: createBookingId(),
    customerName: getCustomerName(),
    service: serviceInput.value,
    date: dateInput.value,
    time: timeInput.value,
    address: addressInput.value.trim(),
    phone: phoneInput.value.trim(),
    problemDescription: descriptionInput.value.trim(),
    description: descriptionInput.value.trim(),
    price: getPrice(),
    status: "Pending",
    trackingStatus: "Pending",
    workerResponse: "Waiting",
    paymentStatus: "Pending",
    assignedWorker: "",
    assignedWorkerPhone: "",
    rejectedWorkers: [],
    createdAt: new Date().toISOString(),
  };

  saveBooking(booking);
  addNotification(
    "Booking request created",
    `Your ${booking.service} request is waiting for a worker. Estimated price ${formatPrice(booking.price)}.`,
    "Booking"
  );
  renderSummary(booking);
  renderBookings();
  successMessage.textContent = "Booking request sent successfully. Waiting for worker response.";
  showToast("Booking request sent successfully.");
  bookingForm.reset();
  updatePrice();
});

bookingsList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-time]");

  if (editButton) {
    const bookingId = editButton.dataset.editTime;
    const select = bookingsList.querySelector(`[data-time-select="${CSS.escape(bookingId)}"]`);

    if (select) {
      updateBookingTime(bookingId, select.value);
    }

    return;
  }

  const button = event.target.closest("[data-cancel-id]");

  if (!button) {
    return;
  }

  const bookingId = button.dataset.cancelId;
  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return {
      ...booking,
      status: "Cancelled",
    };
  });

  setBookings(bookings);

  const latestBooking = bookings[bookings.length - 1];
  if (latestBooking) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(latestBooking));
    renderSummary(latestBooking);
  }

  renderBookings();
  showToast("Booking status updated.");
});

saveSummaryTime.addEventListener("click", () => {
  if (!currentSummaryBookingId || !summaryTimeSelect) {
    showToast("No booking selected to update.", "error");
    return;
  }

  updateBookingTime(currentSummaryBookingId, summaryTimeSelect.value);
});
