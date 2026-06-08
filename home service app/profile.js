const page = document.body.dataset.page;

const defaultUserProfile = {
  name: "HomeFix User",
  email: "user@homefix.example",
  phone: "+91 98765 43210",
};

const defaultSavedAddresses = [
  {
    id: "address-home",
    label: "Home",
    address: "221 Green Avenue, Sector 12",
  },
  {
    id: "address-work",
    label: "Work",
    address: "Floor 4, Market Road, Central Plaza",
  },
];

const defaultPaymentMethods = [
  {
    id: "pay-card-2482",
    type: "Card",
    value: "Visa ending 2482",
    isDefault: true,
  },
  {
    id: "pay-upi-homefix",
    type: "UPI",
    value: "homefix@upi",
    isDefault: false,
  },
];

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

function getUserProfile() {
  const saved = localStorage.getItem("homefixUserProfile");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem("homefixUserProfile", JSON.stringify(defaultUserProfile));
  return defaultUserProfile;
}

function setUserProfile(profile) {
  localStorage.setItem("homefixUserProfile", JSON.stringify(profile));
}

function getSavedAddresses() {
  const saved = localStorage.getItem("homefixSavedAddresses");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem("homefixSavedAddresses", JSON.stringify(defaultSavedAddresses));
  return defaultSavedAddresses;
}

function setSavedAddresses(addresses) {
  localStorage.setItem("homefixSavedAddresses", JSON.stringify(addresses));
}

function getPaymentMethods() {
  const saved = localStorage.getItem("homefixPaymentMethods");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem("homefixPaymentMethods", JSON.stringify(defaultPaymentMethods));
  return defaultPaymentMethods;
}

function setPaymentMethods(methods) {
  localStorage.setItem("homefixPaymentMethods", JSON.stringify(methods));
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAddresses() {
  const addressList = document.querySelector("#addressList");

  if (!addressList) {
    return;
  }

  const addresses = getSavedAddresses();

  if (!addresses.length) {
    addressList.innerHTML = '<p class="empty-state">No saved addresses yet.</p>';
    return;
  }

  addressList.innerHTML = addresses
    .map(
      (item) => `
        <div class="address-card">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <p>${escapeHtml(item.address)}</p>
          </div>
          <button class="remove-address" type="button" data-remove-address="${escapeHtml(item.id)}">Remove</button>
        </div>
      `
    )
    .join("");
}

function setupUserDetails() {
  const name = document.querySelector("#profileName");
  const email = document.querySelector("#profileEmail");
  const phone = document.querySelector("#profilePhone");
  const form = document.querySelector("#userDetailsForm");
  const nameInput = document.querySelector("#userNameInput");
  const emailInput = document.querySelector("#userEmailInput");
  const phoneInput = document.querySelector("#userPhoneInput");
  const status = document.querySelector("#userDetailsStatus");

  if (!form) {
    return;
  }

  function fillProfile(profile) {
    name.textContent = profile.name;
    email.textContent = profile.email;
    phone.textContent = profile.phone;
    nameInput.value = profile.name;
    emailInput.value = profile.email;
    phoneInput.value = profile.phone;
  }

  fillProfile(getUserProfile());

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const profile = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
    };

    if (!profile.name || !profile.email || !profile.phone) {
      status.textContent = "Please fill all user details.";
      showToast("Please fill all user details.", "error");
      return;
    }

    setUserProfile(profile);
    fillProfile(profile);
    status.textContent = "User details saved.";
    showToast("User details saved.");
  });
}

function setupAddresses() {
  const form = document.querySelector("#addressForm");
  const labelInput = document.querySelector("#addressLabelInput");
  const addressInput = document.querySelector("#addressTextInput");
  const addressList = document.querySelector("#addressList");

  if (!form || !addressList) {
    return;
  }

  renderAddresses();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const label = labelInput.value.trim();
    const address = addressInput.value.trim();

    if (!label || !address) {
      showToast("Please enter address label and address.", "error");
      return;
    }

    const addresses = getSavedAddresses();
    addresses.push({
      id: `address-${Date.now()}`,
      label,
      address,
    });

    setSavedAddresses(addresses);
    form.reset();
    renderAddresses();
    showToast("Address saved.");
  });

  addressList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-address]");

    if (!removeButton) {
      return;
    }

    const addresses = getSavedAddresses().filter((item) => item.id !== removeButton.dataset.removeAddress);
    setSavedAddresses(addresses);
    renderAddresses();
    showToast("Address removed.");
  });
}

function renderPayments() {
  const paymentList = document.querySelector("#paymentList");

  if (!paymentList) {
    return;
  }

  const methods = getPaymentMethods();

  if (!methods.length) {
    paymentList.innerHTML = '<p class="empty-state">No payment methods added yet.</p>';
    return;
  }

  paymentList.innerHTML = methods
    .map(
      (method) => `
        <div class="payment-card">
          <div class="payment-main">
            <span class="payment-icon">${escapeHtml(method.type)}</span>
            <div>
              <strong>${escapeHtml(method.value)}</strong>
              <p>${method.isDefault ? "Default payment method" : "Available for checkout"}</p>
            </div>
          </div>
          <div class="payment-actions">
            <button class="payment-action" type="button" data-default-payment="${escapeHtml(method.id)}">Set Default</button>
            <button class="payment-action remove" type="button" data-remove-payment="${escapeHtml(method.id)}">Remove</button>
          </div>
        </div>
      `
    )
    .join("");
}

function setupPayments() {
  const paymentForm = document.querySelector("#paymentForm");
  const paymentType = document.querySelector("#paymentType");
  const paymentValue = document.querySelector("#paymentValue");
  const paymentList = document.querySelector("#paymentList");

  if (!paymentForm || !paymentList) {
    return;
  }

  renderPayments();

  paymentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = paymentValue.value.trim();

    if (!value) {
      paymentValue.focus();
      showToast("Please enter payment details.", "error");
      return;
    }

    const methods = getPaymentMethods();
    methods.push({
      id: `pay-${Date.now()}`,
      type: paymentType.value,
      value,
      isDefault: methods.length === 0,
    });

    setPaymentMethods(methods);
    paymentForm.reset();
    renderPayments();
    showToast("Payment method added.");
  });

  paymentList.addEventListener("click", (event) => {
    const defaultButton = event.target.closest("[data-default-payment]");
    const removeButton = event.target.closest("[data-remove-payment]");

    if (defaultButton) {
      const id = defaultButton.dataset.defaultPayment;
      const methods = getPaymentMethods().map((method) => ({
        ...method,
        isDefault: method.id === id,
      }));

      setPaymentMethods(methods);
      renderPayments();
      showToast("Default payment updated.");
    }

    if (removeButton) {
      const id = removeButton.dataset.removePayment;
      const methods = getPaymentMethods().filter((method) => method.id !== id);

      if (methods.length && !methods.some((method) => method.isDefault)) {
        methods[0].isDefault = true;
      }

      setPaymentMethods(methods);
      renderPayments();
      showToast("Payment method removed.");
    }
  });
}

function renderProfile() {
  const logoutButton = document.querySelector("#logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      showToast("Logged out successfully.");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
    });
  }

  setupUserDetails();
  setupAddresses();
  setupPayments();
}

function detail(label, value) {
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value || "-")}</dd>
    </div>
  `;
}

function renderHistory() {
  const historyList = document.querySelector("#historyList");

  if (!historyList) {
    return;
  }

  const bookings = getBookings().slice().reverse();

  if (!bookings.length) {
    historyList.innerHTML = '<p class="empty-state">No booking history found. Create a booking first.</p>';
    return;
  }

  historyList.innerHTML = bookings
    .map((booking) => {
      const status = booking.status || "Confirmed";
      const isCancelled = status === "Cancelled";

      return `
        <article class="history-card">
          <div class="history-card-header">
            <h3>${escapeHtml(booking.service || "Service booking")}</h3>
            <span class="status-badge${isCancelled ? " cancelled" : ""}">${escapeHtml(status)}</span>
          </div>
          <dl class="history-details">
            ${detail("Booking ID", booking.id)}
            ${detail("Date", booking.date)}
            ${detail("Time", booking.time)}
            ${detail("Address", booking.address)}
            ${detail("Phone", booking.phone)}
            ${detail("Problem", booking.description)}
            ${detail("Estimated Price", booking.price ? formatPrice(normalizeBookingPrice(booking)) : "-")}
            ${detail("Payment", booking.paymentStatus || "Pending")}
            ${detail("Worker", booking.assignedWorker?.name || "Not assigned")}
            ${detail("Created time", formatCreatedTime(booking.createdAt))}
          </dl>
        </article>
      `;
    })
    .join("");
}

if (page === "profile") {
  renderProfile();
}

if (page === "history") {
  renderHistory();
}
