import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const form = document.getElementById("registerForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");

const termsError = document.getElementById("termsError");
const modal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";

  togglePassword.innerHTML = isPassword
    ? '<i class="fa-solid fa-eye-slash"></i>'
    : '<i class="fa-solid fa-eye"></i>';
});

function showError(input, message) {
  const group = input.closest(".input-group");
  const error = group.querySelector(".error");

  if (error) {
    error.textContent = message;
  }
}

function clearError(input) {
  const group = input.closest(".input-group");
  const error = group.querySelector(".error");

  if (error) {
    error.textContent = "";
  }
}

function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanFirebaseMessage(error) {
  if (error.code === "auth/email-already-in-use") {
    return "Este correo ya está registrado.";
  }

  if (error.code === "auth/invalid-email") {
    return "El correo no es válido.";
  }

  if (error.code === "auth/weak-password") {
    return "La contraseña es muy débil.";
  }

  if (error.code === "auth/network-request-failed") {
    return "Error de conexión. Revisa tu internet.";
  }

  if (error.code === "permission-denied") {
    return "No tienes permisos para guardar datos. Revisa las reglas de Firestore.";
  }

  return "Ocurrió un error al registrarte. Intenta de nuevo.";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let valid = true;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (name.length < 3) {
    showError(nameInput, "Escribe tu nombre completo.");
    valid = false;
  } else {
    clearError(nameInput);
  }

  if (!isEmailValid(email)) {
    showError(emailInput, "Escribe un correo válido.");
    valid = false;
  } else {
    clearError(emailInput);
  }

  if (password.length < 8) {
    showError(passwordInput, "La contraseña debe tener mínimo 8 caracteres.");
    valid = false;
  } else {
    clearError(passwordInput);
  }

  if (confirmPassword !== password || confirmPassword === "") {
    showError(confirmPasswordInput, "Las contraseñas no coinciden.");
    valid = false;
  } else {
    clearError(confirmPasswordInput);
  }

  if (!termsInput.checked) {
    termsError.textContent = "Debes aceptar las políticas para continuar.";
    valid = false;
  } else {
    termsError.textContent = "";
  }

  if (!valid) return;

  const submitButton = form.querySelector(".btn-register");
  const originalButtonText = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.innerHTML =
    'Creando cuenta <i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name
    });

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name: name,
      email: email,
      role: "student",
      emailVerified: false,
      status: "pending_verification",
      provider: "email-password",

      policiesAccepted: true,
      policiesAcceptedAt: serverTimestamp(),
      policiesVersion: "2026-01",

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    await sendEmailVerification(user, {
      url: window.location.origin + "/login.html",
      handleCodeInApp: false
    });

    await signOut(auth);

    modal.classList.add("active");
    form.reset();

  } catch (error) {
    console.error(error);

    const message = cleanFirebaseMessage(error);

    if (
      error.code === "auth/email-already-in-use" ||
      error.code === "auth/invalid-email"
    ) {
      showError(emailInput, message);
    } else if (error.code === "auth/weak-password") {
      showError(passwordInput, message);
    } else {
      alert(message);
    }

  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});

closeModal.addEventListener("click", () => {
  modal.classList.remove("active");
  window.location.href = "login.html";
});