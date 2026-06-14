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
}
