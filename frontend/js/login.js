import { auth, db } from "../../backend/firebase/firebase-config.js";

import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function navigate(path) {
  window.dispatchEvent(new CustomEvent("app:navigate", { detail: path }));
}

export function initLogin() {
const form = document.getElementById("loginForm");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const rememberInput = document.getElementById("remember");
const forgotPassword = document.getElementById("forgotPassword");

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

function cleanLoginError(error) {
  if (
    error.code === "auth/invalid-credential" ||
    error.code === "auth/wrong-password" ||
    error.code === "auth/user-not-found"
  ) {
    return "Correo o contraseña incorrectos.";
  }

  if (error.code === "auth/too-many-requests") {
    return "Demasiados intentos. Intenta más tarde.";
  }

  if (error.code === "auth/network-request-failed") {
    return "Error de conexión. Revisa tu internet.";
  }

  return "No se pudo iniciar sesión. Intenta de nuevo.";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let valid = true;

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!isEmailValid(email)) {
    showError(emailInput, "Escribe un correo válido.");
    valid = false;
  } else {
    clearError(emailInput);
  }

  if (password.trim() === "") {
    showError(passwordInput, "Escribe tu contraseña.");
    valid = false;
  } else {
    clearError(passwordInput);
  }

  if (!valid) return;

  const submitButton = form.querySelector(".btn-login");
  const originalButtonText = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.innerHTML = 'Entrando <i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    await setPersistence(
      auth,
      rememberInput.checked
        ? browserLocalPersistence
        : browserSessionPersistence
    );

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    if (!user.emailVerified) {
      await sendEmailVerification(user, {
        url: new URL("../../login", import.meta.url).href,
        handleCodeInApp: false
      });

      await signOut(auth);

      alert(
        "Tu correo todavía no está verificado. Te enviamos otro correo de confirmación."
      );

      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await signOut(auth);
      alert("Tu perfil no existe en la base de datos. Contacta al administrador.");
      return;
    }

    await updateDoc(userRef, {
      emailVerified: true,
      status: "active",
      lastLoginAt: serverTimestamp()
    });

    navigate("dashboard");

  } catch (error) {
    console.error(error);
    showError(passwordInput, cleanLoginError(error));

  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});

forgotPassword.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();

  if (!isEmailValid(email)) {
    showError(emailInput, "Escribe tu correo para recuperar tu contraseña.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: new URL("../../login", import.meta.url).href
    });

    alert("Te enviamos un correo para restablecer tu contraseña.");

  } catch (error) {
    console.error(error);

    if (error.code === "auth/user-not-found") {
      showError(emailInput, "No existe una cuenta con este correo.");
    } else {
      alert("No se pudo enviar el correo de recuperación.");
    }
  }
});
}
