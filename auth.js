// auth.js
// Login/logout and route protection for the owner-only pages (dashboard.html, admin.html).
// Single owner/admin account — no public registration.

import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

export function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logoutUser() {
  return signOut(auth);
}

/**
 * Resolves with the signed-in user, or redirects to login.html (default)
 * if nobody is signed in. Call this at the top of any protected page.
 */
export function requireAuth(redirectPath = 'login.html') {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = redirectPath;
      } else {
        resolve(user);
      }
    });
  });
}
