// theme.js
// Site-wide light/dark theme — the SAME theme for every visitor, sourced
// from a single Firestore doc (settings/site) that only the owner can write
// (see the "settings" rule in firestore.rules). There is no per-visitor
// toggle; regular pages just read and apply whatever the owner has set.
// The owner changes it from the ⋮ menu on dashboard.html, which calls
// setSiteTheme() below.
//
// Loaded on every page (like i18n.js/footer.js), so importing this module
// is enough to have the current site theme applied automatically.
//
// Flash-of-wrong-theme note: since the real value lives in Firestore, a
// pure network fetch on every page would show a flash of the light default
// while it loads. To avoid that, the last-known value is cached in
// localStorage (via data-cache.js) and re-applied synchronously by a tiny
// inline snippet at the very top of each page's <head> — before anything
// renders:
//
//   <script>
//     try {
//       var raw = localStorage.getItem('novaris_cache_theme');
//       if (raw && JSON.parse(raw).data === 'dark') {
//         document.documentElement.setAttribute('data-theme', 'dark');
//       }
//     } catch (e) {}
//   </script>
//
// This module then reconciles with the live Firestore value in the
// background (stale-while-revalidate) and corrects the page if the owner
// changed it since the last cache.

import { db } from './firebase-config.js';
import { cachedFetch, setCache } from './data-cache.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const THEME_CACHE_KEY = 'novaris_cache_theme';
const THEME_TTL_MS = 2 * 60 * 1000; // 2 minutes — owner's change should reach visitors reasonably fast

function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

async function fetchSiteThemeFromFirestore() {
  const snap = await getDoc(doc(db, 'settings', 'site'));
  return snap.exists() && snap.data().theme === 'dark' ? 'dark' : 'light';
}

/** Current site-wide theme ('light' | 'dark'), cached for instant repeat reads. */
export async function getSiteTheme() {
  try {
    return await cachedFetch(THEME_CACHE_KEY, fetchSiteThemeFromFirestore, THEME_TTL_MS);
  } catch {
    return 'light'; // settings doc doesn't exist yet, or offline — light is the safe default
  }
}

/**
 * Owner-only: changes the theme for the WHOLE site. Writes to Firestore
 * (firestore.rules restricts this to the owner's account), applies it to
 * the current page immediately, and updates the local cache so the owner
 * doesn't wait out the TTL to see it reflected on their own next page.
 */
export async function setSiteTheme(theme) {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  await setDoc(doc(db, 'settings', 'site'), { theme: normalized }, { merge: true });
  applyTheme(normalized);
  setCache(THEME_CACHE_KEY, normalized);
  return normalized;
}

applyTheme(await getSiteTheme());
