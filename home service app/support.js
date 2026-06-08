const supportForm = document.querySelector("#supportForm");
const supportName = document.querySelector("#supportName");
const supportEmail = document.querySelector("#supportEmail");
const supportCategory = document.querySelector("#supportCategory");
const supportMessage = document.querySelector("#supportMessage");
const supportSuccess = document.querySelector("#supportSuccess");
const supportHistoryList = document.querySelector("#supportHistoryList");
const ticketDetailPanel = document.querySelector("#ticketDetailPanel");
const ticketDetailContent = document.querySelector("#ticketDetailContent");
const closeTicketDetail = document.querySelector("#closeTicketDetail");

const SUPPORT_KEY = "homefixSupportRequests";

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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function generateTicketId() {
  return `HF-SUP-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
}

function normalizeSupportRequest(request) {
  return {
    ticketId: request.ticketId || request.id || generateTicketId(),
    userName: request.userName || request.name || "HomeFix User",
    email: request.email || "Not provided",
    category: request.category || "Other",
    message: request.message || "",
    createdAt: request.createdAt || new Date().toISOString(),
    status: ["Open", "In Progress", "Resolved"].includes(request.status) ? request.status : "Open",
  };
}

function getSupportRequests() {
  const requests = JSON.parse(localStorage.getItem(SUPPORT_KEY) || "[]").map(normalizeSupportRequest);
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(requests));
  return requests;
}

function saveSupportRequest(request) {
  const requests = getSupportRequests();
  requests.push(request);
  localStorage.setItem(SUPPORT_KEY, JSON.stringify(requests));
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function addNotification(title, message, type = "Support") {
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

function renderSupportHistory() {
  if (!supportHistoryList) {
    return;
  }

  const requests = getSupportRequests().slice().reverse();

  if (!requests.length) {
    supportHistoryList.innerHTML = '<p class="empty-state">No support requests found.</p>';
    return;
  }

  supportHistoryList.innerHTML = requests
    .map(
      (request) => `
        <article class="support-ticket-card">
          <div class="ticket-card-header">
            <div>
              <span class="ticket-id">${escapeHtml(request.ticketId)}</span>
              <h3>${escapeHtml(request.category)}</h3>
            </div>
            <span class="status-badge ${escapeHtml(request.status.toLowerCase().replaceAll(" ", "-"))}">${escapeHtml(request.status)}</span>
          </div>
          <dl class="ticket-details">
            <div>
              <dt>User Name</dt>
              <dd>${escapeHtml(request.userName)}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>${escapeHtml(request.email)}</dd>
            </div>
            <div>
              <dt>Date & Time</dt>
              <dd>${escapeHtml(formatDateTime(request.createdAt))}</dd>
            </div>
            <div class="full">
              <dt>Message</dt>
              <dd>${escapeHtml(request.message)}</dd>
            </div>
          </dl>
          <button class="open-ticket-button" type="button" data-open-ticket="${escapeHtml(request.ticketId)}">Open Ticket</button>
        </article>
      `
    )
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

function openTicket(ticketId) {
  const request = getSupportRequests().find((item) => item.ticketId === ticketId);

  if (!request || !ticketDetailPanel || !ticketDetailContent) {
    return;
  }

  ticketDetailContent.innerHTML = [
    detail("Ticket ID", request.ticketId),
    detail("User Name", request.userName),
    detail("Email", request.email),
    detail("Problem Category", request.category),
    detail("Status", request.status),
    detail("Date & Time", formatDateTime(request.createdAt)),
    detail("Message", request.message),
  ].join("");
  ticketDetailPanel.classList.remove("is-hidden");
  ticketDetailPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

supportHistoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-ticket]");

  if (!button) {
    return;
  }

  openTicket(button.dataset.openTicket);
});

closeTicketDetail.addEventListener("click", () => {
  ticketDetailPanel.classList.add("is-hidden");
});

supportForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const request = {
    ticketId: generateTicketId(),
    userName: supportName.value.trim(),
    email: supportEmail.value.trim(),
    category: supportCategory.value,
    message: supportMessage.value.trim(),
    createdAt: new Date().toISOString(),
    status: "Open",
  };

  if (!request.userName || !request.email || !request.category || !request.message) {
    supportSuccess.textContent = "Please complete all support request fields.";
    showToast("Please complete the support form.", "error");
    return;
  }

  if (!supportEmail.checkValidity()) {
    supportSuccess.textContent = "Please enter a valid email address.";
    showToast("Please enter a valid email address.", "error");
    supportEmail.focus();
    return;
  }

  const button = supportForm.querySelector("button[type='submit']");
  button.classList.add("is-loading");
  button.textContent = "Submitting...";

  saveSupportRequest(request);
  addNotification("Support ticket created", `Ticket ${request.ticketId} is open for ${request.category}.`, "Support");

  supportSuccess.textContent = `Support Request Submitted Successfully. Ticket ID: ${request.ticketId}`;
  showToast(`Support Request Submitted Successfully. Ticket ID: ${request.ticketId}`);
  supportForm.reset();
  button.classList.remove("is-loading");
  button.textContent = "Submit Request";
  renderSupportHistory();
});

renderSupportHistory();
