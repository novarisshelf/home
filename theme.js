// theme.js
// Manual light/dark theme toggle, shared across every page.
//
// Light is always the default for a new visitor — this does NOT auto-follow
// the device/browser's system dark-mode setting. If someone has explicitly
// switched to dark before, that choice is remembered (localStorage) and
// restored on their next visit.
//
// Flash-of-wrong-theme note: applying the saved theme here (after the DOM
// is ready) would show a flash of light for a split second on every page
// for a visitor who'd chosen dark. To avoid that, each page also has a tiny
// inline snippet at the very top of <head> (before anything renders) that
// re-applies the saved theme immediately:
//
//   <script>
//     try {
//       if (localStorage.getItem('novaris_theme') === 'dark') {
//         document.documentElement.setAttribute('data-theme', 'dark');
//       }
//     } catch (e) {}
//   </script>
//
// This module only needs to handle the toggle *button* — building it,
// mounting it in the right spot, and wiring up clicks.

const THEME_KEY = 'novaris_theme';

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY); // 'dark' | 'light' | null
  } catch {
    return null;
  }
}

function isDarkActive() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

function updateButtonIcon(button, dark) {
  const icon = button.querySelector('i');
  icon.className = dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  button.setAttribute('aria-label', dark ? 'লাইট থিম চালু করুন' : 'ডার্ক থিম চালু করুন');
  button.title = dark ? 'Light theme' : 'Dark theme';
}

function setTheme(button, dark) {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch {}
  updateButtonIcon(button, dark);
}

/** Places the toggle wherever this page's header layout has room for it. */
function mount(button) {
  const navbarLinks = document.querySelector('.navbar-links');
  if (navbarLinks) {
    navbarLinks.prepend(button);
    return;
  }

  const ownerBarInner = document.querySelector('.owner-bar-inner');
  if (ownerBarInner) {
    const logoutBtn = document.getElementById('logout-btn');
    ownerBarInner.insertBefore(button, logoutBtn || null);
    return;
  }

  const navbarInner = document.querySelector('.navbar-inner');
  if (navbarInner) {
    navbarInner.appendChild(button);
    return;
  }

  // Defensive fallback for any page without a recognizable header.
  button.classList.add('theme-toggle-floating');
  document.body.appendChild(button);
}

function init() {
  if (document.querySelector('.theme-toggle-btn')) return; // don't double-inject

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle-btn';
  button.innerHTML = '<i class="fa-solid fa-moon"></i>';

  updateButtonIcon(button, isDarkActive());

  button.addEventListener('click', () => {
    setTheme(button, !isDarkActive());
  });

  mount(button);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
