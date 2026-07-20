// js/cart.js
// Cart state, persisted in localStorage under the "novaris_cart" key.
// Structure: [{ itemId, itemType, title, price, qty }]
// itemType is 'book' or 'decor' — this is what lets a single cart hold both
// books (from js/books.js) and Home Decor items (from js/decor.js) together.
//
// If a customer is logged in (js/customer-auth.js), the cart is also
// best-effort synced to their customers/{uid} Firestore doc, so it carries
// over between devices. This is loaded lazily and wrapped in try/catch so
// guest browsing (or a site where Firebase isn't set up yet) still works
// exactly as before — cart sync is a bonus, never a requirement.

const CART_KEY = 'novaris_cart';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
  syncCartToFirestore(cart);
}

let customerAuthModulePromise = null;
function loadCustomerAuth() {
  if (!customerAuthModulePromise) {
    customerAuthModulePromise = import('./customer-auth.js').catch(() => null);
  }
  return customerAuthModulePromise;
}

async function syncCartToFirestore(cart) {
  try {
    const mod = await loadCustomerAuth();
    if (!mod) return;
    const user = mod.getCurrentCustomer();
    if (!user) return;
    const { db } = await import('./firebase-config.js');
    const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js");
    await setDoc(doc(db, 'customers', user.uid), { cart }, { merge: true });
  } catch {
    // Best-effort only — never block the cart UI over a sync failure.
  }
}

/**
 * Call once per page load after login state is known (js/customer-nav.js
 * does this). If the customer has a cart saved in Firestore, merges it into
 * the local cart (higher quantity wins per item) and re-saves.
 */
export async function hydrateCartFromFirestoreIfLoggedIn() {
  try {
    const mod = await loadCustomerAuth();
    if (!mod) return;
    const user = mod.getCurrentCustomer();
    if (!user) return;

    const { db } = await import('./firebase-config.js');
    const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js");
    const snap = await getDoc(doc(db, 'customers', user.uid));
    const remoteCart = snap.exists() ? (snap.data().cart || []) : [];
    if (remoteCart.length === 0) return;

    const localCart = getCart();
    const merged = [...localCart];
    remoteCart.forEach((remoteItem) => {
      const existing = merged.find(
        (i) => i.itemId === remoteItem.itemId && i.itemType === remoteItem.itemType
      );
      if (existing) {
        existing.qty = Math.max(existing.qty, remoteItem.qty);
      } else {
        merged.push(remoteItem);
      }
    });

    localStorage.setItem(CART_KEY, JSON.stringify(merged));
    renderCartBadge();
  } catch {
    // Best-effort only.
  }
}

/**
 * Adds a book or decor item to the cart, or increases qty if it's already there.
 * product: the book or decor item object (needs id, title, currentPrice)
 * itemType: 'book' | 'decor'
 */
export function addToCart(product, itemType, qty = 1) {
  const cart = getCart();
  const existing = cart.find((item) => item.itemId === product.id && item.itemType === itemType);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      itemId: product.id,
      itemType,
      title: product.title,
      price: product.currentPrice,
      qty
    });
  }
  saveCart(cart);
}

export function removeFromCart(itemId, itemType) {
  saveCart(getCart().filter((item) => !(item.itemId === itemId && item.itemType === itemType)));
}

export function updateCartItemQty(itemId, itemType, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.itemId === itemId && i.itemType === itemType);
  if (item) {
    item.qty = Math.max(1, Math.floor(qty) || 1);
    saveCart(cart);
  }
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  renderCartBadge();
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

/** Updates every .cart-badge element on the current page (navbar cart icon). */
export function renderCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach((badge) => {
    badge.textContent = String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}
