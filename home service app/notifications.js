const notificationsList = document.querySelector("#notificationsList");
const markAllRead = document.querySelector("#markAllRead");
const clearRead = document.querySelector("#clearRead");

function showToast(message) {
  const container = document.querySelector("#toastContainer");

  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
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
  return value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";
}

function getNotifications() {
  return JSON.parse(localStorage.getItem("homefixNotifications") || "[]");
}

function setNotifications(notifications) {
  localStorage.setItem("homefixNotifications", JSON.stringify(notifications));
}

function renderNotifications() {
  const notifications = getNotifications().slice().reverse();

  if (!notifications.length) {
    notificationsList.innerHTML = '<p class="empty-state">No notifications found.</p>';
    return;
  }

  notificationsList.innerHTML = notifications
    .map(
      (item) => `
        <article class="notification-card ${item.read ? "" : "unread"}">
          <div class="notification-top">
            <div>
              <h2>${escapeHtml(item.title)}</h2>
              <p>${escapeHtml(item.message)}</p>
            </div>
            <button type="button" data-read-id="${escapeHtml(item.id)}">${item.read ? "Read" : "Mark Read"}</button>
          </div>
          <div class="notification-meta">
            <span class="badge">${escapeHtml(item.type || "Update")}</span>
            <span>${escapeHtml(formatDateTime(item.createdAt))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

notificationsList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-read-id]");

  if (!button) {
    return;
  }

  setNotifications(
    getNotifications().map((item) => (item.id === button.dataset.readId ? { ...item, read: true } : item))
  );
  renderNotifications();
});

markAllRead.addEventListener("click", () => {
  setNotifications(getNotifications().map((item) => ({ ...item, read: true })));
  renderNotifications();
  showToast("All notifications marked read.");
});

clearRead.addEventListener("click", () => {
  setNotifications(getNotifications().filter((item) => !item.read));
  renderNotifications();
  showToast("Read notifications cleared.");
});

renderNotifications();
