// js/firebase-config.js
// Firebase init, shared across every page.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBa4Col-urVpk-DLQwvn-ug0edp_13yz0",
  authDomain: "novaris-c15cd.firebaseapp.com",
  projectId: "novaris-c15cd",
  storageBucket: "novaris-c15cd.firebasestorage.app",
  messagingSenderId: "218052245999",
  appId: "1:218052245999:web:a50587525ad6e257d75e1a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
