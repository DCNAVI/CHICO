import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJW_Ju5nCfaXqVTW_2gM1oAdxg9Jt2OOs",
  authDomain: "academia-chico.firebaseapp.com",
  projectId: "academia-chico",
  storageBucket: "academia-chico.firebasestorage.app",
  messagingSenderId: "946508561679",
  appId: "1:946508561679:web:f59cb012a1a40294e3527a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);