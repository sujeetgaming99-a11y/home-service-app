const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");
const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#serviceSearch");
const categoryCards = document.querySelectorAll(".category-card");
const bookingForm = document.querySelector("#bookingForm");
const bookingService = document.querySelector("#bookingService");
const bookingLocation = document.querySelector("#bookingLocation");
const bookingTime = document.querySelector("#bookingTime");
const bookingMessage = document.querySelector("#bookingMessage");
const confirmSlot = document.querySelector("#confirmSlot");
const activeServiceTitle = document.querySelector("#activeServiceTitle");
const activeServiceMeta = document.querySelector("#activeServiceMeta");
const writeReviewButton = document.querySelector("#writeReviewButton");
const reviewForm = document.querySelector("#reviewForm");
const reviewsGrid = document.querySelector("#reviewsGrid");
const reviewMessage = document.querySelector("#reviewMessage");
const servicePhotoService = document.querySelector("#servicePhotoService");
const servicePhotoUpload = document.querySelector("#servicePhotoUpload");
const servicePhotoPreview = document.querySelector("#servicePhotoPreview");

const services = ["Plumber", "Electrician", "Carpenter", "Painter", "AC Repair", "Cleaning", "Appliance Repair", "Home Maintenance"];
const sampleReviews = [
  {
    name: "Maria G.",
    rating: 5,
    service: "Electrician",
    text: "Booked an electrician before breakfast. He arrived on time and fixed three issues in one visit.",
    date: "Sample review",
  },
  {
    name: "James L.",
    rating: 5,
    service: "Cleaning",
    text: "The cleaner was professional, careful, and the app kept me updated the whole time.",
    date: "Sample review",
  },
  {
    name: "Anika R.",
    rating: 5,
    service: "Plumber",
    text: "Clear pricing, quick support, and the plumber knew exactly what to do. Easy win.",
    date: "Sample review",
  },
  {
    name: "Rohit S.",
    rating: 4,
    service: "AC Repair",
    text: "The AC repair expert explained the issue clearly and completed the service neatly.",
    date: "Sample review",
  },
  {
    name: "Priya M.",
    rating: 5,
    service: "Painter",
    text: "Our bedroom painting was finished on schedule, and the final wall texture looked excellent.",
    date: "Sample review",
  },
];
const serviceDetails = {
  Plumber: {
    title: "Pipe leak repair",
    meta: "Available by 11:30 AM",
  },
  Electrician: {
    title: "Switchboard repair",
    meta: "Available by 12:00 PM",
  },
  Carpenter: {
    title: "Furniture fitting",
    meta: "Available by 1:30 PM",
  },
  Painter: {
    title: "Wall painting visit",
    meta: "Available today evening",
  },
  "AC Repair": {
    title: "AC cooling service",
    meta: "Available in 30 minutes",
  },
  Cleaning: {
    title: "Deep cleaning service",
    meta: "Available today afternoon",
  },
  "Appliance Repair": {
    title: "Appliance diagnosis",
    meta: "Available today evening",
  },
  "Home Maintenance": {
    title: "Home maintenance visit",
    meta: "Available tomorrow morning",
  },
};

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

function selectService(service) {
  if (searchInput) {
    searchInput.value = service;
  }

  if (bookingService) {
    bookingService.value = service;
  }

  if (bookingMessage) {
    bookingMessage.textContent = "";
  }

  if (serviceDetails[service] && activeServiceTitle && activeServiceMeta) {
    activeServiceTitle.textContent = serviceDetails[service].title;
    activeServiceMeta.textContent = serviceDetails[service].meta;
  }

  categoryCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.service === service);
  });
}

function findService(query) {
  return services.find((service) => service.toLowerCase().includes(query.toLowerCase()));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getStoredReviews() {
  return JSON.parse(localStorage.getItem("homefixReviews") || "[]");
}

function saveReview(review) {
  const reviews = getStoredReviews();
  reviews.push(review);
  localStorage.setItem("homefixReviews", JSON.stringify(reviews));
}

function getServiceImages() {
  return JSON.parse(localStorage.getItem("homefixServiceImages") || "{}");
}

function setServiceImages(images) {
  localStorage.setItem("homefixServiceImages", JSON.stringify(images));
}

function getServiceImageSrc(entry) {
  return typeof entry === "string" ? entry : entry?.image;
}

function getUploaderName() {
  const savedProfile = JSON.parse(localStorage.getItem("homefixUserProfile") || "null");

  if (savedProfile?.name) {
    return savedProfile.name;
  }

  const users = JSON.parse(localStorage.getItem("homefixUsers") || "[]");
  const latestUser = users[users.length - 1];

  return latestUser?.name || latestUser?.email || "HomeFix User";
}

function applyServiceImages() {
  const images = getServiceImages();

  categoryCards.forEach((card) => {
    const image = card.querySelector(".service-image");
    const customImage = getServiceImageSrc(images[card.dataset.service]);

    if (image && customImage) {
      image.src = customImage;
    }
  });

  if (servicePhotoService && servicePhotoPreview) {
    const selectedImage = getServiceImageSrc(images[servicePhotoService.value]);
    servicePhotoPreview.classList.toggle("is-hidden", !selectedImage);

    if (selectedImage) {
      servicePhotoPreview.src = selectedImage;
    }
  }
}

function getStars(rating) {
  const safeRating = Math.max(1, Math.min(5, Number(rating) || 1));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

function formatReviewDate(value) {
  if (!value || value === "Sample review") {
    return value || "";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function renderReviews() {
  if (!reviewsGrid) {
    return;
  }

  const reviews = [...sampleReviews, ...getStoredReviews().slice().reverse()];

  reviewsGrid.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="rating">${escapeHtml(getStars(review.rating))}</div>
          <p>"${escapeHtml(review.text)}"</p>
          <small>Service used: ${escapeHtml(review.service)}</small>
          <strong>${escapeHtml(review.name)}</strong>
          <span class="review-date">${escapeHtml(formatReviewDate(review.date))}</span>
        </article>
      `
    )
    .join("");
}

if (bookingForm && bookingLocation) {
  categoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectService(card.dataset.service);
      bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
      bookingLocation.focus();
    });
  });
}

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
      searchInput.focus();
      return;
    }

    const matchingService = findService(query);

    if (matchingService) {
      selectService(matchingService);

      if (bookingForm && bookingLocation) {
        bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
        bookingLocation.focus();
      }
    } else {
      const servicesSection = document.querySelector("#services");

      if (bookingMessage) {
        bookingMessage.textContent = "Please choose one of the available services below.";
      }

      showToast("Please choose an available service.", "error");

      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
}

if (confirmSlot && bookingForm && bookingService && bookingTime && bookingLocation) {
  confirmSlot.addEventListener("click", () => {
    if (!bookingService.value) {
      selectService("Plumber");
    }

    bookingTime.value = "Next 30 minutes";
    bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
    bookingLocation.focus();
  });
}

if (bookingForm && bookingService && bookingLocation && bookingTime) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!bookingForm.checkValidity()) {
      bookingForm.reportValidity();
      return;
    }

    const params = new URLSearchParams({
      service: bookingService.value,
      address: bookingLocation.value.trim(),
      time: bookingTime.value,
    });

    showToast("Opening booking page...");
    window.location.href = `booking.html?${params.toString()}`;
  });
}

if (writeReviewButton && reviewForm) {
  writeReviewButton.addEventListener("click", () => {
    reviewForm.classList.toggle("is-hidden");
    writeReviewButton.textContent = reviewForm.classList.contains("is-hidden") ? "Write a Review" : "Close Review Form";
  });
}

if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const review = {
      name: document.querySelector("#reviewName").value.trim(),
      service: document.querySelector("#reviewService").value,
      rating: document.querySelector("#reviewRating").value,
      text: document.querySelector("#reviewText").value.trim(),
      date: new Date().toISOString(),
    };

    if (!review.name || !review.service || !review.rating || !review.text) {
      if (reviewMessage) {
        reviewMessage.textContent = "Please complete all review fields.";
      }

      showToast("Please complete all review fields.", "error");
      return;
    }

    saveReview(review);
    renderReviews();
    reviewForm.reset();
    reviewForm.classList.add("is-hidden");

    if (writeReviewButton) {
      writeReviewButton.textContent = "Write a Review";
    }

    if (reviewMessage) {
      reviewMessage.textContent = "Review submitted successfully.";
    }

    showToast("Review submitted successfully.");
  });
}

if (servicePhotoService) {
  servicePhotoService.addEventListener("change", applyServiceImages);
}

if (servicePhotoUpload) {
  servicePhotoUpload.addEventListener("change", () => {
    const file = servicePhotoUpload.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const images = getServiceImages();
      images[servicePhotoService.value] = {
        image: reader.result,
        uploadedBy: getUploaderName(),
        uploadedAt: new Date().toISOString(),
      };
      setServiceImages(images);
      applyServiceImages();
      showToast("Service photo updated.");
      servicePhotoUpload.value = "";
    });
    reader.readAsDataURL(file);
  });
}

renderReviews();
applyServiceImages();
