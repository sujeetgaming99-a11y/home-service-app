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
