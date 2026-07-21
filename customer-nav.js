// customer-nav.js
// Lightweight per-page navbar widget for customer login state. Shows a
// "লগইন" link when signed out, or the customer's name + "আমার অর্ডার" +
// logout when signed in (and email-verified). Also triggers a one-time
// cart hydration from Firestore right after a login is detected.
//
// Usage: put <span id="customer-nav-slot" class="navbar-account"></span> in
// the navbar, then include this as a module script on the page.
// Wrapped in try/catch throughout so pages still work fine if Firebase
// isn't reachable — this widget is a bonus, not a requirement.

import { onCustomerAuthChanged, logoutCustomer } from './customer-auth.js';
import { hydrateCartFromFirestoreIfLoggedIn } from './cart.js';

const slot = document.getElementById('customer-nav-slot');

function renderLoggedOut() {
  if (!slot) return;
  slot.innerHTML = `<a href="account.html" class="nav-account-link"><i class="fa-solid fa-user"></i> লগইন</a>`;
}

function renderLoggedIn(user) {
  if (!slot) return;
  const name = (user.displayName || user.email || 'অ্যাকাউন্ট').split(' ')[0];
  slot.innerHTML = `
    <a href="my-orders.html" class="nav-account-link"><i class="fa-solid fa-receipt"></i> আমার অর্ডার</a>
    <button type="button" id="customer-logout-btn" class="nav-account-link nav-account-btn">
      <i class="fa-solid fa-right-from-bracket"></i> ${name}
    </button>
  `;
  document.getElementById('customer-logout-btn')?.addEventListener('click', async () => {
    try {
      await logoutCustomer();
    } finally {
      window.location.reload();
    }
  });
}

try {
  onCustomerAuthChanged(async (user) => {
    if (user && user.emailVerified) {
      renderLoggedIn(user);
      await hydrateCartFromFirestoreIfLoggedIn();
    } else {
      renderLoggedOut();
    }
  });
} catch {
  renderLoggedOut();
}
