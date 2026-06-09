const workersGrid = document.querySelector("#workersGrid");
const workerSearch = document.querySelector("#workerSearch");
const serviceFilter = document.querySelector("#serviceFilter");
const callModal = document.querySelector("#callModal");
const closeCallModal = document.querySelector("#closeCallModal");
const modalWorkerName = document.querySelector("#modalWorkerName");
const modalWorkerPhone = document.querySelector("#modalWorkerPhone");
const copyNumber = document.querySelector("#copyNumber");
const copyStatus = document.querySelector("#copyStatus");

let activePhoneNumber = "";

const defaultWorkers = [
  {
    name: "Rahul Sharma",
    skill: "Plumber",
    rating: 4.9,
    experience: "8 years",
    price: 299,
    phone: "+911234567890",
  },
  {
    name: "Amit Verma",
    skill: "Electrician",
    rating: 4.8,
    experience: "6 years",
    price: 299,
    phone: "+911234567891",
  },
  {
    name: "Karan Mehta",
    skill: "Carpenter",
    rating: 4.7,
    experience: "9 years",
    price: 399,
    phone: "+911234567892",
  },
  {
    name: "Neha Singh",
    skill: "Painter",
    rating: 4.9,
    experience: "7 years",
    price: 999,
    phone: "+911234567893",
  },
  {
    name: "Sameer Khan",
    skill: "AC Repair",
    rating: 4.8,
    experience: "5 years",
    price: 499,
    phone: "+911234567894",
  },
  {
    name: "Priya Nair",
    skill: "Cleaning",
    rating: 4.9,
    experience: "4 years",
    price: 399,
    phone: "+911234567895",
  },
  {
    name: "Arjun Rao",
    skill: "Appliance Repair",
    rating: 4.8,
    experience: "6 years",
    price: 499,
    phone: "+911234567896",
  },
  {
    name: "Meera Iyer",
    skill: "Home Maintenance",
    rating: 4.9,
    experience: "10 years",
    price: 599,
    phone: "+911234567897",
  },
];

const servicePriceRanges = {
  Plumber: "₹299 - ₹799",
  Electrician: "₹299 - ₹999",
  Carpenter: "₹399 - ₹1,499",
  Painter: "₹999 - ₹9,999",
  "AC Repair": "₹499 - ₹2,499",
  Cleaning: "₹399 - ₹1,999",
  "Appliance Repair": "₹499 - ₹1,999",
  "Home Maintenance": "₹599 - ₹2,999",
};

const serviceBasePrices = {
  Plumber: 299,
  Electrician: 299,
  Carpenter: 399,
  Painter: 999,
  "AC Repair": 499,
  Cleaning: 399,
  "Appliance Repair": 499,
  "Home Maintenance": 599,
};

const workerImages = {
  "Rahul Sharma": "assets/worker-rahul.svg",
  "Amit Verma": "assets/worker-amit.svg",
  "Karan Mehta": "assets/worker-karan.svg",
  "Neha Singh": "assets/worker-neha.svg",
  "Sameer Khan": "assets/worker-sameer.svg",
  "Priya Nair": "assets/worker-priya.svg",
  "Arjun Rao": "assets/worker-arjun.svg",
  "Meera Iyer": "assets/worker-meera.svg",
};

function getWorkerImage(worker) {
  const uploadedImages = JSON.parse(localStorage.getItem("homefixWorkerImages") || "{}");
  return uploadedImages[worker.name] || worker.image || worker.imageUrl || workerImages[worker.name] || "assets/worker-default.svg";
}

function saveWorkerImage(workerName, imageData) {
  const uploadedImages = JSON.parse(localStorage.getItem("homefixWorkerImages") || "{}");
  uploadedImages[workerName] = imageData;
  localStorage.setItem("homefixWorkerImages", JSON.stringify(uploadedImages));
}

function formatPrice(value) {
  const amount = Number(value) || 0;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function normalizeWorkerPrice(worker) {
  const skill = worker.skill || worker.service;
  const amount = Number(worker.price) || 0;
  return amount < 100 ? serviceBasePrices[skill] || amount : amount;
}

function getWorkers() {
  const saved = localStorage.getItem("homefixWorkers");
  let workers = saved ? JSON.parse(saved) : defaultWorkers;

  if (!saved) {
    localStorage.setItem("homefixWorkers", JSON.stringify(defaultWorkers.map((worker, index) => ({
      id: `worker-default-${index}`,
      name: worker.name,
      service: worker.skill,
      phone: worker.phone,
      experience: worker.experience,
      rating: worker.rating,
      price: normalizeWorkerPrice(worker),
    }))));
  } else {
    const existingServices = new Set(workers.map((worker) => worker.skill || worker.service));
    const missingDefaults = defaultWorkers
      .filter((worker) => !existingServices.has(worker.skill))
      .map((worker, index) => ({
        id: `worker-added-${Date.now()}-${index}`,
        name: worker.name,
        service: worker.skill,
        phone: worker.phone,
        experience: worker.experience,
        rating: worker.rating,
        price: normalizeWorkerPrice(worker),
      }));

    if (missingDefaults.length) {
      workers = [...workers, ...missingDefaults];
      localStorage.setItem("homefixWorkers", JSON.stringify(workers));
    }
  }

  return workers.map((worker) => ({
    name: worker.name,
    skill: worker.skill || worker.service,
    rating: worker.rating,
    experience: worker.experience,
    price: normalizeWorkerPrice(worker),
    priceLabel: servicePriceRanges[worker.skill || worker.service] || formatPrice(worker.price),
    phone: worker.phone,
    image: getWorkerImage(worker),
  }));
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

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getBookingLink(worker) {
  const params = new URLSearchParams({
    service: worker.skill,
  });

  return `booking.html?${params.toString()}`;
}

function isMobileDevice() {
  return window.matchMedia("(max-width: 767px)").matches || /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function openCallModal(worker) {
  activePhoneNumber = worker.phone;
  modalWorkerName.textContent = worker.name;
  modalWorkerPhone.textContent = worker.phone;
  copyStatus.textContent = "";
  callModal.classList.remove("is-hidden");
  closeCallModal.focus();
}

function closeModal() {
  callModal.classList.add("is-hidden");
}

function renderWorkers() {
  const searchValue = workerSearch.value.trim().toLowerCase();
  const selectedService = serviceFilter.value;
  const workers = getWorkers();

  const filteredWorkers = workers.filter((worker) => {
    const matchesService = selectedService === "All" || worker.skill === selectedService;
    const matchesSearch =
      worker.name.toLowerCase().includes(searchValue) ||
      worker.skill.toLowerCase().includes(searchValue);

    return matchesService && matchesSearch;
  });

  if (!filteredWorkers.length) {
    workersGrid.innerHTML = '<p class="empty-state">No workers found. Try another search or service filter.</p>';
    return;
  }

  workersGrid.innerHTML = filteredWorkers
    .map(
      (worker) => `
        <article class="worker-card">
          <img class="worker-photo" src="${worker.image}" alt="${worker.name} profile photo" width="320" height="320" loading="lazy" />
          <div class="worker-top">
            <span class="avatar">${getInitials(worker.name)}</span>
            <div>
              <h2>${worker.name}</h2>
              <p>${worker.skill}</p>
            </div>
          </div>

          <dl class="worker-meta">
            <div>
              <dt>Rating</dt>
              <dd class="rating">${worker.rating}/5</dd>
            </div>
            <div>
              <dt>Experience</dt>
              <dd>${worker.experience}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>${worker.priceLabel || formatPrice(worker.price)}</dd>
            </div>
            <div>
              <dt>Skill</dt>
              <dd>${worker.skill}</dd>
            </div>
          </dl>

          <div class="worker-actions">
            <a class="call-button" href="tel:${worker.phone}" data-worker-name="${worker.name}" data-worker-phone="${worker.phone}">Call Worker</a>
            <a class="book-button" href="${getBookingLink(worker)}">Book Now</a>
          </div>
          <div class="worker-upload">
            <label for="photo-${getInitials(worker.name)}-${worker.phone.replace(/\D/g, "")}">Upload Photo</label>
            <input
              id="photo-${getInitials(worker.name)}-${worker.phone.replace(/\D/g, "")}"
              type="file"
              accept="image/*"
              data-worker-photo="${worker.name}"
            />
          </div>
        </article>
      `
    )
    .join("");
}

workerSearch.addEventListener("input", renderWorkers);
serviceFilter.addEventListener("change", renderWorkers);

workersGrid.addEventListener("click", (event) => {
  const callButton = event.target.closest(".call-button");

  if (!callButton) {
    return;
  }

  if (isMobileDevice()) {
    return;
  }

  event.preventDefault();

  openCallModal({
    name: callButton.dataset.workerName,
    phone: callButton.dataset.workerPhone,
  });
});

workersGrid.addEventListener("change", (event) => {
  const input = event.target.closest("[data-worker-photo]");

  if (!input) {
    return;
  }

  const file = input.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
    showToast("Please upload a valid image file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    saveWorkerImage(input.dataset.workerPhoto, reader.result);
    renderWorkers();
    showToast("Worker photo updated.");
  });
  reader.readAsDataURL(file);
});

closeCallModal.addEventListener("click", closeModal);

callModal.addEventListener("click", (event) => {
  if (event.target === callModal) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

copyNumber.addEventListener("click", async () => {
  if (!activePhoneNumber) {
    return;
  }

  try {
    await navigator.clipboard.writeText(activePhoneNumber);
    copyStatus.textContent = "Number copied.";
    showToast("Number copied.");
  } catch (error) {
    copyStatus.textContent = activePhoneNumber;
    showToast("Copy unavailable. Number is shown in the popup.", "error");
  }
});

renderWorkers();
