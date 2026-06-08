const forms = {
  loginForm: {
    success: "Login successful. Redirecting to your bookings...",
    fields: {
      loginEmail: "Enter a valid email address.",
      loginPassword: "Password must be at least 6 characters.",
    },
  },
  signupForm: {
    success: "Account created successfully. You can now login.",
    fields: {
      signupName: "Name must be at least 2 characters.",
      signupPhone: "Enter a valid 10 digit phone number.",
      signupEmail: "Enter a valid email address.",
      signupPassword: "Password must be at least 6 characters.",
    },
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

function getFieldError(input, message) {
  const value = input.value.trim();

  if (!value) {
    return "This field is required.";
  }

  if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return message;
  }

  if (input.type === "tel" && !/^\d{10}$/.test(value.replace(/\D/g, ""))) {
    return message;
  }

  if (input.minLength > 0 && value.length < input.minLength) {
    return message;
  }

  return "";
}

function showError(input, error) {
  const field = input.closest(".field");
  const errorMessage = field.querySelector(".error-message");

  field.classList.toggle("invalid", Boolean(error));
  errorMessage.textContent = error;
}

Object.entries(forms).forEach(([formId, config]) => {
  const form = document.querySelector(`#${formId}`);

  if (!form) {
    return;
  }

  const status = form.querySelector(".form-status");
  const inputs = Array.from(form.querySelectorAll("input"));

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      showError(input, "");
      status.textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    inputs.forEach((input) => {
      const error = getFieldError(input, config.fields[input.id]);
      showError(input, error);

      if (error) {
        isValid = false;
      }
    });

    if (!isValid) {
      status.textContent = "";
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    button.classList.add("is-loading");
    button.textContent = formId === "loginForm" ? "Logging in..." : "Creating account...";

    status.textContent = config.success;

    if (formId === "signupForm") {
      const user = {
        id: `user-${Date.now()}`,
        name: document.querySelector("#signupName").value.trim(),
        phone: document.querySelector("#signupPhone").value.trim(),
        email: document.querySelector("#signupEmail").value.trim(),
      };
      const users = JSON.parse(localStorage.getItem("homefixUsers") || "[]");
      users.push(user);
      localStorage.setItem("homefixUsers", JSON.stringify(users));
      localStorage.setItem("homefixUserProfile", JSON.stringify(user));
    }

    showToast(config.success);
    form.reset();

    setTimeout(() => {
      if (formId === "loginForm") {
        window.location.href = "index.html";
      } else {
        window.location.href = "login.html";
      }
    }, 900);
  });
});

