export function initErrorPage() {
  const retryButton = document.querySelector("[data-error-retry]");
  const backButton = document.querySelector("[data-error-back]");

  retryButton?.addEventListener("click", () => {
    window.location.reload();
  });

  backButton?.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.dispatchEvent(new CustomEvent("app:navigate", { detail: "" }));
  });
}
