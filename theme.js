// theme.js
// Tiny, dependency-free personal light/dark theme preference — mirrors how
// i18n.js handles language. Each visitor picks their own; it's stored in
// their browser (localStorage) and applied on every page, same as language.
// This is NOT site-wide/shared — it doesn't touch Firestore at all, so one
// visitor's choice never affects anyone else.
//
// The actual on/off control lives in my-account.html's settings (⋮) menu,
// right next to the language switcher. Every other page just imports this
// module (already wired in via <script type="module" src="theme.js">) so
// the visitor's saved preference gets applied consistently everywhere.
//
// Unlike language, switching theme does NOT reload the page — it's pure
// CSS (a single attribute flip), so the change can apply instantly.
//
// Flash-of-wrong-theme note: a tiny inline snippet at the very top of each
// page's <head> re-applies the saved theme synchronously before anything
// renders:
//
//   <script>
//     try {
//       if (localStorage.getItem('novaris_theme') === 'dark') {
//         document.documentElement.setAttribute('data-theme', 'dark');
//       }
//     } catch (e) {}
//   </script>
//
// This module's own applyTheme(getTheme()) call on load is what makes it
// correct even without that snippet; the snippet just avoids a flash for
// visitors who'd chosen dark.

const STORAGE_KEY = 'novaris_theme';

/** Current personal theme preference for this browser: 'light' | 'dark'. */
export function getTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/** Saves the visitor's choice and applies it immediately (no reload needed). */
export function setTheme(theme) {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  try {
    localStorage.setItem(STORAGE_KEY, normalized);
  } catch {
    // localStorage unavailable — the choice just won't persist across pages/visits.
  }
  applyTheme(normalized);
  return normalized;
}

applyTheme(getTheme());
