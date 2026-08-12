const modal = document.querySelector("#resume-modal");
const dialog = modal.querySelector(".resume-dialog");
const form = document.querySelector("#resume-access-form");
const emailInput = document.querySelector("#resume-email");
const statusMessage = document.querySelector("#resume-status");
const submitButton = form.querySelector("button[type='submit']");
const resumeTriggers = document.querySelectorAll(".resume-gate-trigger");
const closeControls = modal.querySelectorAll("[data-close-modal]");
const resumeUrl = "Claire_Gu_Resume.pdf";
const accessKey = "claire_resume_access";
let lastFocusedElement = null;

function hasAccess() {
  return window.localStorage.getItem(accessKey) === "granted";
}

function openResume() {
  window.open(resumeUrl, "_blank", "noopener,noreferrer");
}

function openModal() {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  statusMessage.textContent = "";
  window.requestAnimationFrame(() => emailInput.focus());
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove("modal-open");
  statusMessage.textContent = "";
  if (lastFocusedElement) lastFocusedElement.focus();
}

resumeTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    if (hasAccess()) openResume();
    else openModal();
  });
});

closeControls.forEach((control) => control.addEventListener("click", closeModal));

modal.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
    return;
  }

  if (event.key !== "Tab") return;
  const focusable = [...dialog.querySelectorAll("button, input, a[href]")].filter((item) => !item.disabled);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  submitButton.disabled = true;
  submitButton.textContent = "Opening…";
  statusMessage.textContent = "";

  try {
    const response = await fetch("https://formsubmit.co/ajax/clairegu.connect@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        _subject: "New portfolio résumé view",
        source: window.location.hostname || "local preview",
      }),
    });

    if (!response.ok) throw new Error("Submission failed");

    window.localStorage.setItem(accessKey, "granted");
    closeModal();
    openResume();
    form.reset();
  } catch (error) {
    statusMessage.textContent = "Couldn’t connect. Please try again or email Claire directly.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "View résumé ↗";
  }
});
