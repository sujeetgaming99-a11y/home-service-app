const totalBookings = document.querySelector("#totalBookings");
const totalUsers = document.querySelector("#totalUsers");
const totalWorkers = document.querySelector("#totalWorkers");
const totalRevenue = document.querySelector("#totalRevenue");
const openSupport = document.querySelector("#openSupport");
const paidBookings = document.querySelector("#paidBookings");
const recentBookings = document.querySelector("#recentBookings");
const supportRequestsTable = document.querySelector("#supportRequestsTable");
const paymentsTable = document.querySelector("#paymentsTable");
const notificationsTable = document.querySelector("#notificationsTable");
const adminTicketDetailPanel = document.querySelector("#adminTicketDetailPanel");
const adminTicketDetailContent = document.querySelector("#adminTicketDetailContent");
const closeAdminTicketDetail = document.querySelector("#closeAdminTicketDetail");
const workerForm = document.querySelector("#workerForm");
const editingWorkerId = document.querySelector("#editingWorkerId");
const workerSubmitButton = document.querySelector("#workerSubmitButton");
const cancelWorkerEdit = document.querySelector("#cancelWorkerEdit");
const workerStatus = document.querySelector("#workerStatus");
const workerList = document.querySelector("#workerList");
const serviceUploadsList = document.querySelector("#serviceUploadsList");
const toggleServiceUploads = document.querySelector("#toggleServiceUploads");

const workerFields = {
  name: document.querySelector("#workerName"),
  service: document.querySelector("#workerService"),
  phone: document.querySelector("#workerPhone"),
  experience: document.querySelector("#workerExperience"),
  rating: document.querySelector("#workerRating"),
  price: document.querySelector("#workerPrice"),
};

const bookingStatuses = ["Pending", "Worker Accepted", "On The Way", "Work Started", "Completed", "Confirmed", "Worker Assigned", "Worker On The Way", "Cancelled"];
const supportStatuses = ["Open", "In Progress", "Resolved"];

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

function normalizeWorkerPrice(worker) {
  const amount = Number(worker.price) || 0;
  return amount < 100 ? servicePrices[worker.service] || amount : amount;
}

const defaultWorkerImages = {
  "Rahul Sharma": "assets/worker-rahul.svg",
  "Amit Verma": "assets/worker-amit.svg",
  "Karan Mehta": "assets/worker-karan.svg",
  "Neha Singh": "assets/worker-neha.svg",
  "Sameer Khan": "assets/worker-sameer.svg",
  "Priya Nair": "assets/worker-priya.svg",
  "Arjun Rao": "assets/worker-arjun.svg",
  "Meera Iyer": "assets/worker-meera.svg",
};

function getWorkerImages() {
  return JSON.parse(localStorage.getItem("homefixWorkerImages") || "{}");
}

function setWorkerImages(images) {
  localStorage.setItem("homefixWorkerImages", JSON.stringify(images));
}

function getWorkerImage(worker) {
  const uploadedImages = getWorkerImages();
  return uploadedImages[worker.name] || worker.image || worker.imageUrl || defaultWorkerImages[worker.name] || "assets/worker-default.svg";
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getBookings() {
  return JSON.parse(localStorage.getItem("homefixBookings") || "[]");
}

function setBookings(bookings) {
  localStorage.setItem("homefixBookings", JSON.stringify(bookings));
}

function getAssignedWorkerName(booking) {
  if (typeof booking.assignedWorker === "string") {
    return booking.assignedWorker || "Not assigned";
  }

  return booking.assignedWorker?.name || "Not assigned";
}

function getAssignedWorkerId(booking) {
  if (typeof booking.assignedWorker === "object" && booking.assignedWorker?.id) {
    return booking.assignedWorker.id;
  }

  const workerName = getAssignedWorkerName(booking);
  return getWorkers().find((worker) => worker.name === workerName)?.id || "";
}

function getPayments() {
  return JSON.parse(localStorage.getItem("homefixPayments") || "[]");
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function setNotifications(notifications) {
  localStorage.setItem("homefixNotifications", JSON.stringify(notifications));
}

function addNotification(title, message, type = "Admin") {
  const notifications = getNotifications();
  notifications.push({
    id: `NTF-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
  setNotifications(notifications);
}

function getWorkers() {
  const saved = localStorage.getItem("homefixWorkers");

  if (saved) {
    let workers = JSON.parse(saved);
    const existingServices = new Set(workers.map((worker) => worker.service || worker.skill));
    const missingDefaults = defaultWorkers.filter((worker) => !existingServices.has(worker.service));

    if (missingDefaults.length) {
      workers = [...workers, ...missingDefaults];
      localStorage.setItem("homefixWorkers", JSON.stringify(workers));
    }

    return workers;
  }

  localStorage.setItem("homefixWorkers", JSON.stringify(defaultWorkers));
  return defaultWorkers;
}

function setWorkers(workers) {
  localStorage.setItem("homefixWorkers", JSON.stringify(workers));
}

function getServiceImages() {
  return JSON.parse(localStorage.getItem("homefixServiceImages") || "{}");
}

function getServiceImageSrc(entry) {
  return typeof entry === "string" ? entry : entry?.image;
}

function getCurrentUploaderName() {
  const savedProfile = JSON.parse(localStorage.getItem("homefixUserProfile") || "null");

  if (savedProfile?.name) {
    return savedProfile.name;
  }

  const users = JSON.parse(localStorage.getItem("homefixUsers") || "[]");
  const latestUser = users[users.length - 1];

  return latestUser?.name || latestUser?.email || "HomeFix User";
}

function getServiceUploadMeta(entry) {
  const fallbackUploader = getCurrentUploaderName();

  if (typeof entry === "string") {
    return {
      uploadedBy: fallbackUploader,
      uploadedAt: "",
    };
  }

  return {
    uploadedBy: entry?.uploadedBy || fallbackUploader,
    uploadedAt: entry?.uploadedAt || "",
  };
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function generateSupportTicketId() {
  return `HF-SUP-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function normalizeSupportRequest(request) {
  return {
    ticketId: request.ticketId || request.id || generateSupportTicketId(),
    userName: request.userName || request.name || "HomeFix User",
    email: request.email || "Not provided",
    category: request.category || "Other",
    message: request.message || "",
    createdAt: request.createdAt || new Date().toISOString(),
    status: supportStatuses.includes(request.status) ? request.status : "Open",
  };
}

function getSupportRequests() {
  const requests = JSON.parse(localStorage.getItem("homefixSupportRequests") || "[]").map(normalizeSupportRequest);
  localStorage.setItem("homefixSupportRequests", JSON.stringify(requests));
  return requests;
}

function setSupportRequests(requests) {
  localStorage.setItem("homefixSupportRequests", JSON.stringify(requests));
}

function getUserCount() {
  const users = JSON.parse(localStorage.getItem("homefixUsers") || "[]");

  if (users.length) {
    return users.length;
  }

  return localStorage.getItem("homefixUserProfile") ? 1 : 0;
}

function normalizeAdminStatus(status) {
  if (!status || status === "Booking Confirmed") {
    return "Pending";
  }

  if (status === "Service Completed") {
    return "Completed";
  }

  return status;
}

function renderStats() {
  const bookings = getBookings();
  const payments = getPayments();
  const supportRequests = getSupportRequests();
  const revenue = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);

  totalBookings.textContent = bookings.length;
  totalUsers.textContent = getUserCount();
  totalWorkers.textContent = getWorkers().length;
  totalRevenue.textContent = formatPrice(revenue);
  openSupport.textContent = supportRequests.filter((request) => request.status !== "Resolved").length;
  paidBookings.textContent = bookings.filter((booking) => booking.paymentStatus === "Paid").length;
}

function renderBookings() {
  const bookings = getBookings().slice().reverse();
  const workers = getWorkers();

  if (!bookings.length) {
    recentBookings.innerHTML = '<tr><td colspan="9">No bookings found.</td></tr>';
    return;
  }

  recentBookings.innerHTML = bookings
    .map((booking) => {
      const status = normalizeAdminStatus(booking.status);
      const options = bookingStatuses
        .map((item) => `<option value="${item}" ${item === status ? "selected" : ""}>${item}</option>`)
        .join("");
      const workerOptions = workers
        .filter((worker) => !booking.service || worker.service === booking.service || worker.skill === booking.service)
        .map((worker) => {
          const selected = getAssignedWorkerId(booking) === worker.id || getAssignedWorkerName(booking) === worker.name;
          return `<option value="${escapeHtml(worker.id)}" ${selected ? "selected" : ""}>${escapeHtml(worker.name)}</option>`;
        })
        .join("");

      return `
        <tr>
          <td>${escapeHtml(booking.id)}</td>
          <td>${escapeHtml(booking.service)}</td>
          <td>${escapeHtml(booking.date)}</td>
          <td>${escapeHtml(booking.time)}</td>
          <td>${escapeHtml(booking.phone)}</td>
          <td>
            <select data-worker-assign="${escapeHtml(booking.id)}">
              <option value="">Assign worker</option>
              ${workerOptions}
            </select>
          </td>
          <td>${escapeHtml(getAssignedWorkerName(booking))}</td>
          <td>${escapeHtml(booking.workerResponse || "Waiting")}</td>
          <td>${escapeHtml(booking.paymentStatus || "Pending")}</td>
          <td>
            <select data-booking-status="${escapeHtml(booking.id)}">
              ${options}
            </select>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderPayments() {
  const payments = getPayments().slice().reverse();

  if (!payments.length) {
    paymentsTable.innerHTML = '<tr><td colspan="7">No payments found.</td></tr>';
    return;
  }

  paymentsTable.innerHTML = payments
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

function renderNotifications() {
  const notifications = getNotifications().slice().reverse().slice(0, 12);

  if (!notifications.length) {
    notificationsTable.innerHTML = '<tr><td colspan="6">No notifications found.</td></tr>';
    return;
  }

  notificationsTable.innerHTML = notifications
    .map(
      (notification) => `
        <tr>
          <td>${escapeHtml(notification.id)}</td>
          <td>${escapeHtml(notification.type || "Update")}</td>
          <td>${escapeHtml(notification.title)}</td>
          <td class="message-cell">${escapeHtml(notification.message)}</td>
          <td>${escapeHtml(formatDateTime(notification.createdAt))}</td>
          <td>${notification.read ? "Yes" : "No"}</td>
        </tr>
      `
    )
    .join("");
}

function renderSupportRequests() {
  const requests = getSupportRequests().slice().reverse();

  if (!requests.length) {
    supportRequestsTable.innerHTML = '<tr><td colspan="7">No support requests found.</td></tr>';
    return;
  }

  supportRequestsTable.innerHTML = requests
    .map((request) => {
      const options = supportStatuses
        .map((status) => `<option value="${status}" ${status === request.status ? "selected" : ""}>${status}</option>`)
        .join("");

      return `
        <tr>
          <td>${escapeHtml(request.ticketId)}</td>
          <td>${escapeHtml(request.userName)}</td>
          <td>${escapeHtml(request.category)}</td>
          <td class="message-cell">${escapeHtml(request.message)}</td>
          <td>${escapeHtml(formatDateTime(request.createdAt))}</td>
          <td>
            <select data-support-status="${escapeHtml(request.ticketId)}">
              ${options}
            </select>
          </td>
          <td>
            <button class="open-ticket-button" type="button" data-open-ticket="${escapeHtml(request.ticketId)}">Open</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function detail(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function openAdminTicket(ticketId) {
  const request = getSupportRequests().find((item) => item.ticketId === ticketId);

  if (!request || !adminTicketDetailPanel || !adminTicketDetailContent) {
    return;
  }

  adminTicketDetailContent.innerHTML = [
    detail("Ticket ID", request.ticketId),
    detail("User Name", request.userName),
    detail("Email", request.email),
    detail("Problem Category", request.category),
    detail("Status", request.status),
    detail("Date & Time", formatDateTime(request.createdAt)),
    detail("Message", request.message),
  ].join("");
  adminTicketDetailPanel.classList.remove("is-hidden");
  adminTicketDetailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderServiceUploads() {
  if (!serviceUploadsList) {
    return;
  }

  const uploads = Object.entries(getServiceImages()).filter(([, entry]) => getServiceImageSrc(entry));

  if (toggleServiceUploads) {
    toggleServiceUploads.textContent = `Show Photos (${uploads.length})`;
  }

  if (!uploads.length) {
    serviceUploadsList.innerHTML = '<p class="empty-state">No uploaded service photos found.</p>';
    return;
  }

  serviceUploadsList.innerHTML = uploads
    .map(([service, entry]) => {
      const imageSrc = getServiceImageSrc(entry);
      const meta = getServiceUploadMeta(entry);

      return `
        <article class="service-upload-card">
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(service)} uploaded service photo" />
          <div class="service-upload-content">
            <span class="service-upload-label">Service</span>
            <h3>${escapeHtml(service)}</h3>
            <p><strong>Uploaded by:</strong> ${escapeHtml(meta.uploadedBy)}</p>
            <p><strong>Uploaded at:</strong> ${escapeHtml(formatDateTime(meta.uploadedAt))}</p>
            <p class="service-upload-note">Saved in localStorage</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function setupServiceUploadsToggle() {
  if (!toggleServiceUploads || !serviceUploadsList) {
    return;
  }

  toggleServiceUploads.addEventListener("click", () => {
    const isOpen = serviceUploadsList.classList.toggle("is-hidden") === false;
    toggleServiceUploads.setAttribute("aria-expanded", String(isOpen));
    toggleServiceUploads.textContent = isOpen
      ? "Hide Photos"
      : `Show Photos (${Object.entries(getServiceImages()).filter(([, entry]) => getServiceImageSrc(entry)).length})`;
  });
}

function renderWorkers() {
  const workers = getWorkers();

  if (!workers.length) {
    workerList.innerHTML = '<p class="empty-state">No workers added yet.</p>';
    renderStats();
    return;
  }

  workerList.innerHTML = workers
    .map(
      (worker) => `
        <article class="worker-card">
          <img class="admin-worker-photo" src="${escapeHtml(getWorkerImage(worker))}" alt="${escapeHtml(worker.name)} profile photo" />
          <div>
            <h3>${escapeHtml(worker.name)}</h3>
            <p>${escapeHtml(worker.service)} - ${escapeHtml(worker.experience)}</p>
            <p>${escapeHtml(worker.phone)} - Rating ${escapeHtml(worker.rating)}/5 - ${escapeHtml(formatPrice(normalizeWorkerPrice(worker)))}</p>
          </div>
          <div class="worker-card-actions">
            <button class="edit-worker" type="button" data-edit-worker="${escapeHtml(worker.id)}">Edit</button>
            <label class="upload-worker-dp" for="dp-${escapeHtml(worker.id)}">Upload DP</label>
            <input id="dp-${escapeHtml(worker.id)}" type="file" accept="image/*" data-worker-dp="${escapeHtml(worker.id)}" />
            <button class="delete-worker" type="button" data-delete-worker="${escapeHtml(worker.id)}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");

  renderStats();
}

function resetWorkerForm() {
  workerForm.reset();
  editingWorkerId.value = "";
  workerSubmitButton.textContent = "Add Worker";
  cancelWorkerEdit.classList.add("is-hidden");
}

function startWorkerEdit(workerId) {
  const worker = getWorkers().find((item) => item.id === workerId);

  if (!worker) {
    showToast("Worker not found.", "error");
    return;
  }

  editingWorkerId.value = worker.id;
  workerFields.name.value = worker.name || "";
  workerFields.service.value = worker.service || worker.skill || "";
  workerFields.phone.value = worker.phone || "";
  workerFields.experience.value = worker.experience || "";
  workerFields.rating.value = worker.rating || "";
  workerFields.price.value = normalizeWorkerPrice(worker) || "";
  workerSubmitButton.textContent = "Update Worker";
  cancelWorkerEdit.classList.remove("is-hidden");
  workerStatus.textContent = `Editing ${worker.name}`;
  workerForm.scrollIntoView({ behavior: "smooth", block: "center" });
  workerFields.name.focus();
}

function updateWorkerDp(workerId, file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please upload a valid image file.", "error");
    return;
  }

  const worker = getWorkers().find((item) => item.id === workerId);

  if (!worker) {
    showToast("Worker not found.", "error");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const images = getWorkerImages();
    images[worker.name] = reader.result;
    setWorkerImages(images);
    renderWorkers();
    showToast("Worker DP updated.");
  });
  reader.readAsDataURL(file);
}

recentBookings.addEventListener("change", (event) => {
  const select = event.target.closest("[data-booking-status]");

  if (!select) {
    return;
  }

  const bookingId = select.dataset.bookingStatus;
  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return {
      ...booking,
      status: select.value,
      trackingStatus: select.value,
      workerResponse: ["Worker Accepted", "On The Way", "Work Started"].includes(select.value)
        ? "Accepted"
        : select.value === "Completed"
          ? "Completed"
          : booking.workerResponse || "Waiting",
    };
  });

  setBookings(bookings);

  const updatedBooking = bookings.find((booking) => booking.id === bookingId);
  if (updatedBooking) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(updatedBooking));
  }

  addNotification("Booking status updated", `Booking ${bookingId} changed to ${select.value}.`, "Admin");
  renderBookings();
  renderNotifications();
  renderStats();
  showToast("Booking status updated.");
});

recentBookings.addEventListener("change", (event) => {
  const select = event.target.closest("[data-worker-assign]");

  if (!select || !select.value) {
    return;
  }

  const bookingId = select.dataset.workerAssign;
  const worker = getWorkers().find((item) => item.id === select.value);

  if (!worker) {
    return;
  }

  const bookings = getBookings().map((booking) => {
    if (booking.id !== bookingId) {
      return booking;
    }

    return {
      ...booking,
      status: "Worker Accepted",
      trackingStatus: "Worker Accepted",
      assignedWorker: worker.name,
      assignedWorkerPhone: worker.phone,
      assignedWorkerId: worker.id,
      workerResponse: "Accepted by Admin",
      assignedWorkerService: worker.service || worker.skill || booking.service,
    };
  });

  setBookings(bookings);
  const updatedBooking = bookings.find((booking) => booking.id === bookingId);
  if (updatedBooking) {
    localStorage.setItem("homefixLastBooking", JSON.stringify(updatedBooking));
  }

  addNotification("Worker assigned", `${worker.name} assigned to booking ${bookingId}.`, "Admin");
  renderBookings();
  renderNotifications();
  renderStats();
  showToast("Worker assigned successfully.");
});

supportRequestsTable.addEventListener("change", (event) => {
  const select = event.target.closest("[data-support-status]");

  if (!select) {
    return;
  }

  const ticketId = select.dataset.supportStatus;
  const requests = getSupportRequests().map((request) => {
    if (request.ticketId !== ticketId) {
      return request;
    }

    return {
      ...request,
      status: select.value,
    };
  });

  setSupportRequests(requests);
  renderSupportRequests();
  renderStats();
  showToast("Support request status updated.");
});

supportRequestsTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-ticket]");

  if (!button) {
    return;
  }

  openAdminTicket(button.dataset.openTicket);
});

closeAdminTicketDetail.addEventListener("click", () => {
  adminTicketDetailPanel.classList.add("is-hidden");
});

workerForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const worker = {
    id: editingWorkerId.value || `worker-${Date.now()}`,
    name: workerFields.name.value.trim(),
    service: workerFields.service.value,
    phone: workerFields.phone.value.trim(),
    experience: workerFields.experience.value.trim(),
    rating: Number(workerFields.rating.value).toFixed(1),
    price: Number(workerFields.price.value),
  };

  if (!worker.name || !worker.service || !worker.phone || !worker.experience || !worker.rating || !worker.price) {
    workerStatus.textContent = "Please fill all worker fields.";
    showToast("Please fill all worker fields.", "error");
    return;
  }

  const button = workerSubmitButton;
  button.classList.add("is-loading");
  button.textContent = editingWorkerId.value ? "Updating..." : "Adding...";

  const workers = editingWorkerId.value
    ? getWorkers().map((item) => (item.id === editingWorkerId.value ? worker : item))
    : [...getWorkers(), worker];
  setWorkers(workers);

  workerStatus.textContent = editingWorkerId.value ? "Worker updated successfully." : "Worker added successfully.";
  showToast(editingWorkerId.value ? "Worker updated successfully." : "Worker added successfully.");
  button.classList.remove("is-loading");
  resetWorkerForm();
  renderWorkers();
});

workerList.addEventListener("click", (event) => {
  const editButton = event.target.closest("[data-edit-worker]");

  if (editButton) {
    startWorkerEdit(editButton.dataset.editWorker);
    return;
  }

  const button = event.target.closest("[data-delete-worker]");

  if (!button) {
    return;
  }

  const workers = getWorkers().filter((worker) => worker.id !== button.dataset.deleteWorker);
  setWorkers(workers);
  renderWorkers();
  showToast("Worker deleted.");
});

workerList.addEventListener("change", (event) => {
  const input = event.target.closest("[data-worker-dp]");

  if (!input) {
    return;
  }

  updateWorkerDp(input.dataset.workerDp, input.files?.[0]);
  input.value = "";
});

cancelWorkerEdit.addEventListener("click", () => {
  resetWorkerForm();
  workerStatus.textContent = "Edit cancelled.";
});

renderStats();
renderBookings();
renderSupportRequests();
renderPayments();
renderNotifications();
renderServiceUploads();
setupServiceUploadsToggle();
renderWorkers();
