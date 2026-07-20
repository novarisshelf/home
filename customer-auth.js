// js/customer-auth.js
// Customer-facing authentication — separate from js/auth.js, which is the
// single owner/admin account gate for dashboard.html/admin.html. Any visitor
// can sign up here; login is optional site-wide, but required to view
// my-orders.html and to have the cart sync to Firestore across devices.
//
// NOTE on cooldowns: password-reset and resend-verification cooldowns are
// tracked in localStorage (per browser), not enforced server-side. This is a
// client-side courtesy limit, not a security control — good enough for this
// project's scale (no Cloud Functions in the stack), but a determined user
// could clear localStorage to bypass it.

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const RESET_COOLDOWN_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

function getCooldownRemaining(key) {
  const until = parseInt(localStorage.getItem(key) || '0', 10);
  return Math.max(0, until - Date.now());
}
function setCooldown(key, ms) {
  localStorage.setItem(key, String(Date.now() + ms));
}

/** name, email, phone (optional), password → creates the account, saves a
 * customers/{uid} profile doc, and emails a verification link. The user stays
 * signed in (but unverified) so the "resend email" button on the waiting
 * screen keeps working. */
export async function signupWithEmail(name, email, phone, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await setDoc(doc(db, 'customers', cred.user.uid), {
    name,
    email,
    phone: phone || '',
    createdAt: serverTimestamp()
  });
  await sendEmailVerification(cred.user);
  setCooldown(`novaris_resend_${cred.user.uid}`, RESEND_COOLDOWN_MS);
  return cred.user;
}

/** Rejects with { code: 'auth/email-not-verified' } if the account exists
 * but hasn't clicked the verification link yet. */
export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  if (!cred.user.emailVerified) {
    await signOut(auth);
    const err = new Error('Email not verified');
    err.code = 'auth/email-not-verified';
    throw err;
  }
  return cred.user;
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  // Google accounts are verified by definition — make sure a profile doc exists.
  await setDoc(doc(db, 'customers', cred.user.uid), {
    name: cred.user.displayName || '',
    email: cred.user.email || '',
    phone: '',
    createdAt: serverTimestamp()
  }, { merge: true });
  return cred.user;
}

export async function resetPassword(email) {
  const key = `novaris_reset_${email.toLowerCase()}`;
  const remaining = getCooldownRemaining(key);
  if (remaining > 0) {
    const err = new Error('Cooldown active');
    err.code = 'auth/reset-cooldown';
    err.remainingMs = remaining;
    throw err;
  }
  await sendPasswordResetEmail(auth, email);
  setCooldown(key, RESET_COOLDOWN_MS);
}

export async function getResetCooldownRemaining(email) {
  return getCooldownRemaining(`novaris_reset_${email.toLowerCase()}`);
}

/** Only works while the just-signed-up (unverified) user is still in
 * session — i.e. on the "check your inbox" waiting screen right after signup. */
export async function resendVerificationEmail() {
  if (!auth.currentUser) {
    const err = new Error('Not signed in');
    err.code = 'auth/user-not-found';
    throw err;
  }
  const key = `novaris_resend_${auth.currentUser.uid}`;
  const remaining = getCooldownRemaining(key);
  if (remaining > 0) {
    const err = new Error('Cooldown active');
    err.code = 'auth/reset-cooldown';
    err.remainingMs = remaining;
    throw err;
  }
  await sendEmailVerification(auth.currentUser);
  setCooldown(key, RESEND_COOLDOWN_MS);
}

/** Fires on every auth state change (login, logout, token refresh on load). */
export function onCustomerAuthChanged(callback) {
  return onAuthStateChanged(auth, callback);
}

/** The signed-in, verified customer — or null if signed out / unverified. */
export function getCurrentCustomer() {
  const user = auth.currentUser;
  return user && user.emailVerified ? user : null;
}

/** Redirects to account.html unless a verified customer is signed in. */
export function requireCustomerAuth(redirectPath = 'account.html') {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user || !user.emailVerified) {
        window.location.href = redirectPath;
      } else {
        resolve(user);
      }
    });
  });
}

export function logoutCustomer() {
  return signOut(auth);
}
