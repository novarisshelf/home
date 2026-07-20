# Novaris — বাংলা অনলাইন দোকান (বই + ঘর সাজানোর জিনিসপত্র)

Firebase-backed shop demo. Vanilla HTML/CSS/JS (ES modules), built for GitHub Pages. Two independent catalogs — **বই** and **Home Decor** (Hobby & Collectibles + ঘর সাজানোর জিনিস) — share one storefront, one cart, and one checkout.

## What's already built
- All pages: `index.html`, `book.html`, `decor-item.html`, `cart.html`, `login.html`, `dashboard.html`, `admin.html`, `admin-decor.html`
- Shared theme in `css/style.css` (maroon + cream, Tiro Bangla / Hind Siliguri type)
- `js/books.js` reads live from Firestore's `books` collection (same one `admin.html` writes to) — books added/edited/deleted in the admin panel show up on the homepage and detail page automatically. If Firestore isn't set up yet, or the `books` collection is empty, it falls back to **18 placeholder books** (6 each across বিজ্ঞান / উপন্যাস / কবিতা) so the site still works with zero setup
- `js/decor.js` works the same way for the **Home Decor** section, reading from a separate `decorItems` Firestore collection (written to by `admin-decor.html`), with its own small placeholder catalog (Hobby & Collectibles + ঘর সাজানোর জিনিস) as a zero-setup fallback
- Homepage (`index.html`) shows book genre shelves first, then a "Home Decor" section with its own category shelves — plus one search box that searches across **both** catalogs at once
- One shared cart → checkout → order flow (books and decor items can sit in the same cart, same order), wired to localStorage + Firestore + EmailJS
- Owner login, order dashboard, and **two** admin panels — `admin.html` for books, `admin-decor.html` for Home Decor items — all Firestore-backed
- **Customer accounts (optional)** — `account.html` lets any visitor sign up / log in (email+password or Google), separate from the owner's `login.html`. Logging in is never required to browse or check out, but if a customer is logged in: their cart syncs to Firestore (carries over between devices) and their past orders are saved to their account, viewable at `my-orders.html`
- `firestore.rules` with sensible default permissions (see below) — **note:** if you already deployed rules before this update, add matching blocks for the new `decorItems` and `customers` collections (see the Firestore Rules note below)

You can open `index.html` right now (e.g. via VS Code's Live Server, or `python3 -m http.server`) and browse/add-to-cart/checkout against the placeholder data — everything except the last two Firestore/EmailJS steps in checkout will work immediately.

## What you still need to do

**1. Create the Firebase project** (new, dedicated to Novaris — not reused from Munan.hub)
   - [console.firebase.google.com](https://console.firebase.google.com) → Add project
   - Build → Firestore Database → Create database (production mode)
   - Build → Authentication → Sign-in method → enable **Email/Password**
   - Authentication → Users → Add user → this is your one owner/admin login
   - Project settings → General → Your apps → Web app (`</>`) → copy the config object
   - Paste those values into `js/firebase-config.js` (replace the `YOUR_...` placeholders)
   - Firestore → Rules → paste in the contents of `firestore.rules` → Publish

**2. Set up EmailJS** (emailjs.com)
   - Create an Email Service (e.g. connect your Gmail)
   - Create an Email Template with variables: `to_email`, `customer_name`, `customer_phone`, `customer_address`, `customer_email`, `order_items`, `order_total`
   - Copy your Service ID, Template ID, and Public Key into `js/checkout.js`
   - Set `OWNER_EMAIL` in `js/checkout.js` to your real email

**3. Set up customer accounts**
   - Authentication → Sign-in method → enable **Google** as a provider too (Email/Password should already be enabled from step 1) — this lets `account.html`'s "Continue with Google" button work
   - The first time someone visits `my-orders.html`, its Firestore query (orders for one customer, newest first) will likely fail with a console error containing a link like "Create the index in the Firebase console" — click that link once and Firestore builds it automatically (takes a minute or two). This only needs to happen once per project.
   - Update Firestore Rules (see the **Firestore Rules** note below) to allow each signed-in customer to read/write only their own `customers/{uid}` document, and to read their own orders

**4. Update footer contact info**
   - `js/footer.js` currently has placeholder email, address, and WhatsApp number — swap in the real ones

**5. Add real books & decor items**
   - Once step 1 is done, log in at `login.html` → `admin.html` for books, `admin-decor.html` for Home Decor items (writes straight to Firestore)
   - `js/books.js` and `js/decor.js` already read from Firestore, so items appear on `index.html` / `book.html` / `decor-item.html` automatically — no code change needed. Each catalog's placeholder items stop showing as soon as at least one real item exists in its collection

**6. Deploy**
   - Push this folder to a GitHub repo → Settings → Pages → deploy from branch (root)

## Firestore Rules (decorItems + customers)
This project's `firestore.rules` file isn't part of what was shared with me, so I couldn't edit it directly — add rules like these for the two new collections (matching the same public-read / owner-only-write pattern `books` already uses for `decorItems`, plus new customer-scoped rules):

```
match /decorItems/{itemId} {
  allow read: if true;
  allow write: if request.auth != null && request.auth.token.email == "YOUR_OWNER_EMAIL";
}

match /customers/{uid} {
  // Each customer can only read/write their own profile + saved cart.
  allow read, write: if request.auth != null && request.auth.uid == uid;
}

match /orders/{orderId} {
  // Owner can read/write everything (unchanged).
  allow read, write: if request.auth != null && request.auth.token.email == "YOUR_OWNER_EMAIL";
  // A logged-in customer can also read their own past orders, and create a
  // new order tagged with their own uid (guest checkout still works too,
  // since customerUid is null for guests and this rule only applies when
  // customerUid matches the signed-in customer's uid).
  allow read: if request.auth != null && resource.data.customerUid == request.auth.uid;
  allow create: if request.auth == null || request.auth.uid == request.resource.data.customerUid;
}
```

Adjust to match your actual `books` rule style (e.g. if it checks a custom claim or a specific admin UID instead of email).

## Notes
- Cart persists in `localStorage` under the key `novaris_cart`, per page reload/session, until checkout or manual clear. Each cart line now stores `{ itemId, itemType, title, price, qty }` — `itemType` is `'book'` or `'decor'`, which is what lets one cart hold both. **If you had items in your cart from before this update, clear it once** (old entries used a different shape and won't be recognized).
- If a customer is logged in, their cart is also saved to Firestore (`customers/{uid}.cart`) so it follows them to another device/browser. This is best-effort — if Firebase isn't reachable, the site quietly falls back to localStorage-only, exactly like before.
- Password-reset and resend-verification cooldowns (in `account.html`) are tracked in the browser's `localStorage`, not enforced server-side — there's no Cloud Functions in this stack. It's a courtesy limit to stop accidental double-clicks, not a real rate limit; treat it as such.
- `dashboard.html`, `admin.html`, and `admin-decor.html` are all gated by `js/auth.js` (the single owner account). `my-orders.html` is gated separately by `js/customer-auth.js` (any signed-up, email-verified customer) — these are two independent login systems by design, since the owner and customers are different kinds of users.
- Cover images currently point to placeholder URLs (`placehold.co`) — replace with real cover/product URLs, or drop files in `assets/images/` and point to those instead.
