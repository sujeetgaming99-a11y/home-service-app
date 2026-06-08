const workerNameSelect = document.querySelector("#workerNameSelect");
const workerServiceSelect = document.querySelector("#workerServiceSelect");
const workerSummary = document.querySelector("#workerSummary");
const jobGrid = document.querySelector("#jobGrid");
const jobCount = document.querySelector("#jobCount");

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

const acceptedStatuses = ["Worker Accepted", "On The Way", "Work Started", "Completed"];

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
  return `\u20b9${amount.toLocaleString("en-IN")}`;
}

function normalizeBookingPrice(booking) {
  const amount = Number(booking.price) || 0;
  return amount < 100 ? servicePrices[booking.service] || amount : amount;
}

function getWorkers() {
  const saved = JSON.parse(localStorage.getItem("homefixWorkers") || "[]");

  if (saved.length) {
    const existingServices = new Set(saved.map((worker) => worker.service || worker.skill));
    const missingDefaults = defaultWorkers.filter((worker) => !existingServices.has(worker.service));
    const workers = missingDefaults.length ? [...saved, ...missingDefaults] : saved;
    localStorage.setItem("homefixWorkers", JSON.stringify(workers));
    return workers;
  }

  localStorage.setItem("homefixWorkers", JSON.stringify(defaultWorkers));
  return defaultWorkers;
}

function getBookings() {
  return JSON.parse(localStorage.getItem("homefixBookings") || "[]");
}

function setBookings(bookings) {
  localStorage.setItem("homefixBookings", JSON.stringify(bookings));
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function addNotification(title, message, type = "Worker") {
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

function getWorkerService(worker) {
  return worker?.service || worker?.skill || "";
}

function getAssignedWorkerName(booking) {
  if (typeof booking.assignedWorker === "string") {
    return booking.assignedWorker;
  }

  return booking.assignedWorker?.name || "";
}

function getSelectedWorker() {
  const workers = getWorkers();
  const workerName = workerNameSelect.value;
  const service = workerServiceSelect.value;
  return workers.find((worker) => worker.name === workerName && getWorkerService(worker) === service);
}

function updateLastBooking(booking) {
  const lastBooking = JSON.parse(localStorage.getItem("homefixLastBooking") || "null");

  if (lastBooking?.id === booking.id) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(booking));
  }
}

function detail(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function populateSelectors() {
  const workers = getWorkers();
  const services = [...new Set(workers.map(getWorkerService).filter(Boolean))];

  workerNameSelect.innerHTML = '<option value="">Select worker</option>' + workers.map((worker) => `<option value="${escapeHtml(worker.name)}">${escapeHtml(worker.name)}</option>`).join("");
  workerServiceSelect.innerHTML = '<option value="">Select service</option>' + services.map((service) => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`).join("");
}

function renderJobs() {
  const worker = getSelectedWorker();

  if (!worker) {
    workerSummary.textContent = "Select a worker to view job requests.";
    jobCount.textContent = "0 jobs";
    jobGrid.innerHTML = '<p class="empty-state">Select worker details to load matching requests.</p>';
    return;
  }

  const workerService = getWorkerService(worker);
  workerSummary.textContent = `${worker.name} - ${workerService} - ${worker.phone}`;

  const jobs = getBookings()
    .slice()
    .reverse()
    .filter((booking) => {
      const assignedWorker = getAssignedWorkerName(booking);
      const rejectedWorkers = booking.rejectedWorkers || [];
      const isAvailable = !assignedWorker && !["Cancelled", "Completed", "Service Completed"].includes(booking.status);
      const isAcceptedByWorker = assignedWorker === worker.name && acceptedStatuses.includes(booking.status);

      return booking.service === workerService && !rejectedWorkers.includes(worker.name) && (isAvailable || isAcceptedByWorker);
    });

  jobCount.textContent = `${jobs.length} ${jobs.length === 1 ? "job" : "jobs"}`;

  if (!jobs.length) {
    jobGrid.innerHTML = '<p class="empty-state">No matching requests right now.</p>';
    return;
  }

  jobGrid.innerHTML = jobs
    .map((booking) => {
      const assignedWorker = getAssignedWorkerName(booking);
      const isAcceptedByCurrentWorker = assignedWorker === worker.name;

      return `
        <article class="job-card">
          <div class="job-card-header">
            <div>
              <h3>${escapeHtml(booking.customerName || "HomeFix Customer")}</h3>
              <span>${escapeHtml(booking.service)}</span>
            </div>
            <span class="status-pill">${escapeHtml(booking.status || "Pending")}</span>
          </div>
          <dl class="job-details">
            ${detail("Customer", booking.customerName || "HomeFix Customer")}
            ${detail("Service", booking.service)}
            ${detail("Address", booking.address)}
            ${detail("Problem", booking.problemDescription || booking.description)}
            ${detail("Date & Time", `${booking.date || "-"} ${booking.time || ""}`.trim())}
            ${detail("Price", formatPrice(normalizeBookingPrice(booking)))}
            ${detail("Phone", booking.phone)}
            ${detail("Response", booking.workerResponse || "Waiting")}
          </dl>
          ${
            isAcceptedByCurrentWorker
              ? `<div class="status-actions">
                  ${["On The Way", "Work Started", "Completed"]
                    .map((status) => `<button class="${booking.status === status ? "active" : ""}" type="button" data-status="${escapeHtml(status)}" data-booking="${escapeHtml(booking.id)}">${escapeHtml(status)}</button>`)
                    .join("")}
                </div>`
              : `<div class="job-actions">
                  <button type="button" data-accept="${escapeHtml(booking.id)}">Accept</button>
                  <button class="reject-job" type="button" data-reject="${escapeHtml(booking.id)}">Reject</button>
                </div>`
          }
        </article>
      `;
    })
    .join("");
}

function updateBooking(bookingId, updater) {
  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return updater(booking);
  });

  setBookings(bookings);
  const updatedBooking = bookings.find((booking) => booking.id === bookingId);

  if (updatedBooking) {
    updateLastBooking(updatedBooking);
  }

  return updatedBooking;
}

function acceptJob(bookingId) {
  const worker = getSelectedWorker();

  if (!worker) {
    showToast("Select worker first.", "error");
    return;
  }

  const updatedBooking = updateBooking(bookingId, (booking) => ({
    ...booking,
    status: "Worker Accepted",
    trackingStatus: "Worker Accepted",
    assignedWorker: worker.name,
    assignedWorkerId: worker.id,
    assignedWorkerPhone: worker.phone,
    assignedWorkerService: getWorkerService(worker),
    workerResponse: "Accepted",
  }));

  if (updatedBooking) {
    addNotification("Worker accepted booking", `${worker.name} accepted booking ${updatedBooking.id}.`, "Worker");
    showToast("Job accepted.");
  }

  renderJobs();
}

function rejectJob(bookingId) {
  const worker = getSelectedWorker();

  if (!worker) {
    showToast("Select worker first.", "error");
    return;
  }

  const updatedBooking = updateBooking(bookingId, (booking) => ({
    ...booking,
    workerResponse: "Rejected by this worker",
    rejectedWorkers: [...new Set([...(booking.rejectedWorkers || []), worker.name])],
  }));

  if (updatedBooking) {
    addNotification("Worker rejected booking", `${worker.name} rejected booking ${updatedBooking.id}.`, "Worker");
    showToast("Job rejected for this worker.");
  }

  renderJobs();
}

function updateStatus(bookingId, status) {
  const worker = getSelectedWorker();

  const updatedBooking = updateBooking(bookingId, (booking) => ({
    ...booking,
    status,
    trackingStatus: status,
    workerResponse: status === "Completed" ? "Completed" : "Accepted",
  }));

  if (updatedBooking) {
    addNotification("Job status updated", `${worker?.name || "Worker"} changed booking ${updatedBooking.id} to ${status}.`, "Worker");
    showToast(`Status updated to ${status}.`);
  }

  renderJobs();
}

workerNameSelect.addEventListener("change", () => {
  const worker = getWorkers().find((item) => item.name === workerNameSelect.value);

  if (worker) {
    workerServiceSelect.value = getWorkerService(worker);
  }

  renderJobs();
});

workerServiceSelect.addEventListener("change", renderJobs);

jobGrid.addEventListener("click", (event) => {
  const acceptButton = event.target.closest("[data-accept]");
  const rejectButton = event.target.closest("[data-reject]");
  const statusButton = event.target.closest("[data-status]");

  if (acceptButton) {
    acceptJob(acceptButton.dataset.accept);
    return;
  }

  if (rejectButton) {
    rejectJob(rejectButton.dataset.reject);
    return;
  }

  if (statusButton) {
    updateStatus(statusButton.dataset.booking, statusButton.dataset.status);
  }
});

populateSelectors();
renderJobs();
