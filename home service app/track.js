const emptyState = document.querySelector("#emptyState");
const trackContent = document.querySelector("#trackContent");
const assignedMessage = document.querySelector("#assignedMessage");
const workerInitials = document.querySelector("#workerInitials");
const workerName = document.querySelector("#workerName");
const workerService = document.querySelector("#workerService");
const workerPhone = document.querySelector("#workerPhone");
const callWorker = document.querySelector("#callWorker");
const payNow = document.querySelector("#payNow");
const cancelBooking = document.querySelector("#cancelBooking");
const statusMessage = document.querySelector("#statusMessage");
const bookingDetails = document.querySelector("#bookingDetails");
const timeline = document.querySelector("#timeline");
const nextStatusButton = document.querySelector("#nextStatusButton");

const statusSteps = ["Pending", "Worker Accepted", "On The Way", "Work Started", "Completed"];

const workerByService = {
  Plumber: { name: "Rahul Sharma", phone: "+911234567890" },
  Electrician: { name: "Amit Verma", phone: "+911234567891" },
  Carpenter: { name: "Karan Mehta", phone: "+911234567892" },
  Painter: { name: "Neha Singh", phone: "+911234567893" },
  "AC Repair": { name: "Sameer Khan", phone: "+911234567894" },
  Cleaning: { name: "Priya Nair", phone: "+911234567895" },
  "Appliance Repair": { name: "Arjun Rao", phone: "+911234567896" },
  "Home Maintenance": { name: "Meera Iyer", phone: "+911234567897" },
};

function getWorkers() {
  return JSON.parse(localStorage.getItem("homefixWorkers") || "[]");
}

function getWorkerForService(service) {
  const savedWorker = getWorkers().find((worker) => (worker.service || worker.skill) === service);

  if (savedWorker) {
    return {
      name: savedWorker.name,
      phone: savedWorker.phone,
    };
  }

  return workerByService[service] || { name: "HomeFix Expert", phone: "+911234567899" };
}

function getAssignedWorker(booking) {
  if (typeof booking.assignedWorker === "string" && booking.assignedWorker) {
    return {
      name: booking.assignedWorker,
      phone: booking.assignedWorkerPhone || getWorkerForService(booking.service).phone,
      service: booking.assignedWorkerService || booking.service,
    };
  }

  if (booking.assignedWorker?.name) {
    return booking.assignedWorker;
  }

  return {
    name: "Waiting for worker",
    phone: "",
    service: booking.service,
  };
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function addNotification(title, message, type = "Tracking") {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPrice(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString("en-IN")}`;
}

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

function normalizeBookingPrice(booking) {
  const amount = Number(booking.price) || 0;
  return amount < 100 ? servicePrices[booking.service] || amount : amount;
}

function getActiveBooking() {
  return getBookings()
    .slice()
    .reverse()
    .find((booking) => !["Cancelled", "Completed", "Service Completed"].includes(booking.status));
}

function normalizeStatus(status) {
  if (!status || status === "Confirmed" || status === "Booking Confirmed") {
    return "Pending";
  }

  if (status === "Worker Assigned") {
    return "Worker Accepted";
  }

  if (status === "Worker On The Way") {
    return "On The Way";
  }

  if (status === "Service Completed") {
    return "Completed";
  }

  return status;
}

function detail(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function showNoBooking() {
  emptyState.classList.remove("is-hidden");
  trackContent.classList.add("is-hidden");
}

function updateBookingStatus(bookingId, status) {
  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return {
      ...booking,
      status,
    };
  });

  setBookings(bookings);

  const updatedBooking = bookings.find((booking) => booking.id === bookingId);
  if (updatedBooking) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(updatedBooking));
  }
}

function renderTimeline(booking) {
  const currentStatus = normalizeStatus(booking.status);
  const currentIndex = Math.max(0, statusSteps.indexOf(currentStatus));

  timeline.innerHTML = statusSteps
    .map((step, index) => {
      const isActive = index <= currentIndex;
      const isCurrent = index === currentIndex;

      return `<li class="${isActive ? "active" : ""} ${isCurrent ? "current" : ""}">${escapeHtml(step)}</li>`;
    })
    .join("");

  nextStatusButton.dataset.bookingId = booking.id;
  const hasAcceptedWorker = Boolean(getAssignedWorker(booking).name && getAssignedWorker(booking).name !== "Waiting for worker");
  nextStatusButton.disabled = !hasAcceptedWorker || currentIndex >= statusSteps.length - 1;
  nextStatusButton.textContent = !hasAcceptedWorker
    ? "Waiting for Worker"
    : currentIndex >= statusSteps.length - 1
      ? "Service Completed"
      : "Move to Next Status";
}

function renderTracking() {
  const booking = getActiveBooking();

  if (!booking) {
    showNoBooking();
    return;
  }

  const worker = getAssignedWorker(booking);
  const hasWorker = Boolean(worker.name && worker.name !== "Waiting for worker");

  emptyState.classList.add("is-hidden");
  trackContent.classList.remove("is-hidden");

  assignedMessage.textContent = hasWorker ? `Worker assigned for booking ${booking.id}.` : `Booking ${booking.id} is waiting for a worker.`;
  workerInitials.textContent = getInitials(worker.name);
  workerName.textContent = worker.name;
  workerService.textContent = booking.service;
  workerPhone.textContent = worker.phone || "Phone available after acceptance";
  callWorker.href = worker.phone ? `tel:${worker.phone}` : "#";
  callWorker.classList.toggle("is-disabled", !worker.phone);
  payNow.href = `payment.html?booking=${encodeURIComponent(booking.id)}`;
  payNow.classList.toggle("is-disabled", booking.paymentStatus === "Paid");
  payNow.textContent = booking.paymentStatus === "Paid" ? "Payment Done" : "Pay Now";

  bookingDetails.innerHTML = [
    detail("Booking ID", booking.id),
    detail("Service", booking.service),
    detail("Status", normalizeStatus(booking.status)),
    detail("Date", booking.date),
    detail("Time", booking.time),
    detail("Address", booking.address),
    detail("Phone", booking.phone),
    detail("Problem", booking.problemDescription || booking.description),
    detail("Estimated Price", booking.price ? formatPrice(normalizeBookingPrice(booking)) : "-"),
    detail("Payment Status", booking.paymentStatus || "Pending"),
    detail("Worker Response", booking.workerResponse || "Waiting"),
    detail("Assigned Worker", hasWorker ? worker.name : "Not assigned"),
    detail("Worker Phone", worker.phone || "-"),
  ].join("");

  cancelBooking.dataset.bookingId = booking.id;
  renderTimeline(booking);
}

cancelBooking.addEventListener("click", () => {
  const bookingId = cancelBooking.dataset.bookingId;

  if (!bookingId) {
    return;
  }

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
  localStorage.setItem("homefixLastBooking", JSON.stringify(bookings[bookings.length - 1]));
  statusMessage.textContent = "Booking cancelled successfully.";
  addNotification("Booking cancelled", `Booking ${bookingId} was cancelled.`, "Booking");
  showToast("Booking cancelled successfully.");
  renderTracking();
});

nextStatusButton.addEventListener("click", () => {
  const booking = getActiveBooking();

  if (!booking) {
    return;
  }

  const currentStatus = normalizeStatus(booking.status);
  const currentIndex = Math.max(0, statusSteps.indexOf(currentStatus));
  const nextStatus = statusSteps[currentIndex + 1];

  if (!nextStatus) {
    return;
  }

  updateBookingStatus(booking.id, nextStatus);
  statusMessage.textContent = `Booking status updated to ${nextStatus}.`;
  addNotification("Tracking updated", `Booking ${booking.id} status changed to ${nextStatus}.`, "Tracking");
  showToast(`Booking status updated to ${nextStatus}.`);
  renderTracking();
});

renderTracking();
