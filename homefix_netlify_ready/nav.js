document.querySelectorAll(".menu-toggle").forEach((button) => {
  const nav = button.closest("nav");
  const menu = nav?.querySelector(".nav-links, .nav-actions");

  if (!menu) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  menu.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      menu.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
    }
  });
});

/* Auto mobile bottom navigation for all main pages */
(function () {
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const hideOn = ["login.html", "signup.html", "admin.html", "worker-dashboard.html"];
  if (hideOn.includes(page)) return;

  if (document.querySelector(".bottom-nav")) return;

  const nav = document.createElement("nav");
  nav.className = "bottom-nav";
  nav.setAttribute("aria-label", "Mobile bottom navigation");
  nav.innerHTML = `
    <a href="index.html" data-page="index.html"><span>H</span><small>Home</small></a>
    <a href="booking.html" data-page="booking.html"><span>B</span><small>Booking</small></a>
    <a href="workers.html" data-page="workers.html"><span>W</span><small>Workers</small></a>
    <a href="profile.html" data-page="profile.html"><span>P</span><small>Profile</small></a>
  `;
  document.body.appendChild(nav);

  nav.querySelectorAll("a").forEach((a) => {
    if (a.dataset.page === page || (page === "" && a.dataset.page === "index.html")) {
      a.classList.add("active");
    }
  });
})();
