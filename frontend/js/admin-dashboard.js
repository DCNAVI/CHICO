import { auth, db } from "../../backend/firebase/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

function navigate(path) {
  window.dispatchEvent(new CustomEvent("app:navigate", { detail: path }));
}

async function getUserProfile(userId) {
  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function initAdminDashboard() {
  const welcomeTitle = document.getElementById("adminWelcomeTitle");
  const logoutButton = document.getElementById("adminLogoutButton");

  await auth.authStateReady();

  if (!auth.currentUser) {
    navigate("login");
    return null;
  }

  const profile = await getUserProfile(auth.currentUser.uid);

  if (profile?.role !== "admin") {
    navigate("cliente/dashboard");
    return null;
  }

  const name =
    profile.name ||
    auth.currentUser.displayName ||
    auth.currentUser.email ||
    "administrador";
  welcomeTitle.textContent = `Bienvenido, ${name}`;

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("login");
    }
  });

  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    navigate("login");
  });

  return unsubscribe;
}
