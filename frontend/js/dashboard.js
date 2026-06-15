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

export async function initDashboard() {
  const welcomeTitle = document.getElementById("welcomeTitle");
  const logoutButton = document.getElementById("logoutButton");

  await auth.authStateReady();

  if (!auth.currentUser) {
    navigate("error/401");
    return null;
  }

  const userSnapshot = await getDoc(doc(db, "users", auth.currentUser.uid));
  const profile = userSnapshot.exists() ? userSnapshot.data() : null;

  if (!profile) {
    await signOut(auth);
    navigate("error/401");
    return null;
  }

  if (profile.role === "admin") {
    navigate("admin/dashboard");
    return null;
  }

  const initialName =
    profile.name ||
    auth.currentUser.displayName ||
    auth.currentUser.email ||
    "estudiante";
  welcomeTitle.textContent = `Bienvenido, ${initialName}`;

  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      navigate("login");
      return;
    }

    const name = user.displayName || user.email || "estudiante";
    welcomeTitle.textContent = `Bienvenido, ${name}`;
  });

  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    navigate("login");
  });

  return unsubscribe;
}
