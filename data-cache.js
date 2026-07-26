// data-cache.js
// Shared localStorage cache for read-mostly catalog data (books, decor items),
// so navigating between pages doesn't re-fetch the same collection from
// Firestore every single time — the ~2s "loading" pause on every page nav.
//
// Pattern: stale-while-revalidate.
// - First-ever visit (nothing cached anywhere): waits for the real fetch,
//   then saves it. Unavoidable — there's nothing to show yet.
// - Any later page load, even after full navigation/reload: returns the
//   cached copy IMMEDIATELY (no waiting), and if it's older than `ttlMs`,
//   quietly re-fetches in the background and updates the cache for the
//   *next* page load. The current page never blocks on that refresh.
// - If a background refresh fails (offline, Firestore hiccup, etc.), the
//   old cached copy just keeps being used — nothing breaks.
// - A failed fetch is never cached (so a transient outage can't "poison"
//   the cache with bad/placeholder data for the next several minutes).
//
// Cache also lives in an in-memory Map so that repeated calls within the
// same page (e.g. index.html asking for books more than once) don't even
// touch localStorage/JSON.parse more than once per key.

const memoryCache = new Map();

function readFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full/unavailable (private browsing, quota, etc.) — fine,
    // caching is a nice-to-have, not a requirement.
  }
}

function refreshInBackground(key, fetchFn) {
  fetchFn()
    .then((data) => {
      memoryCache.set(key, data);
      writeToStorage(key, data);
    })
    .catch(() => {
      // Stay on the stale-but-valid cached copy already returned to the caller.
    });
}

/**
 * @param {string} key - unique cache key, e.g. 'novaris_cache_books'
 * @param {() => Promise<any>} fetchFn - resolves with fresh data; should
 *   throw/reject on failure (don't swallow errors here — that's how this
 *   module knows not to cache a bad result).
 * @param {number} ttlMs - how long a cached copy is considered fresh before
 *   a background refresh is triggered (default 10 minutes).
 */
export async function cachedFetch(key, fetchFn, ttlMs = 10 * 60 * 1000) {
  if (memoryCache.has(key)) return memoryCache.get(key);

  const entry = readFromStorage(key);
  if (entry) {
    memoryCache.set(key, entry.data);
    if (Date.now() - entry.savedAt > ttlMs) refreshInBackground(key, fetchFn);
    return entry.data;
  }

  // Nothing cached anywhere yet — this is the one time we must actually wait.
  const data = await fetchFn();
  memoryCache.set(key, data);
  writeToStorage(key, data);
  return data;
}

/** Wipes a single cache entry (memory + localStorage). Handy after admin edits. */
export function clearCache(key) {
  memoryCache.delete(key);
  try { localStorage.removeItem(key); } catch {}
}
