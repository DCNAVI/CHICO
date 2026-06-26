export function initHome() {
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const button = item.querySelector("button");

    button.addEventListener("click", () => {
      item.classList.toggle("active");

      const icon = button.querySelector("span");
      icon.textContent = item.classList.contains("active") ? "−" : "+";
    });
  });

  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileNav.classList.toggle("open");
      menuToggle.querySelector("i").className = isOpen
        ? "fa-solid fa-xmark"
        : "fa-solid fa-bars";
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        menuToggle.querySelector("i").className = "fa-solid fa-bars";
      });
    });
  }
}
