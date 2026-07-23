// customer-nav.js
// Lightweight per-page navbar widget for customer login state. Shows a
// "লগইন" link when signed out, or a "ড্যাশবোর্ড" link (to my-account.html)
// when signed in (and email-verified). Also triggers a one-time cart
// hydration from Firestore right after a login is detected.
//
// Usage: put <span id="customer-nav-slot" class="navbar-account"></span> in
// the navbar, then include this as a module script on the page.
// Wrapped in try/catch throughout so pages still work fine if Firebase
// isn't reachable — this widget is a bonus, not a requirement.

import { onCustomerAuthChanged } from './customer-auth.js';
import { hydrateCartFromFirestoreIfLoggedIn } from './cart.js';

const slot = document.getElementById('customer-nav-slot');

function renderLoggedOut() {
  if (!slot) return;
  slot.innerHTML = `<a href="account.html" class="nav-account-link"><i class="fa-solid fa-user"></i> লগইন</a>`;
}

function renderLoggedIn(user) {
  if (!slot) return;
  slot.innerHTML = `<a href="my-account.html" class="nav-account-link"><i class="fa-solid fa-user"></i> ড্যাশবোর্ড</a>`;
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
