# Novaris — বাংলা অনলাইন দোকান (বই + ঘর সাজানোর জিনিসপত্র)

Firebase-backed shop demo. Vanilla HTML/CSS/JS (ES modules), built for GitHub Pages. Two independent catalogs — **বই** and **Home Decor** (Hobby & Collectibles + ঘর সাজানোর জিনিস) — share one storefront, one cart, and one checkout. All files sit flat in the repo root (no `js/`/`css/` subfolders).

## What's already built
- All pages: `index.html`, `book.html`, `decor-item.html`, `cart.html`, `login.html`, `dashboard.html`, `admin.html`, `admin-decor.html`, `account.html`, `my-orders.html`, `my-account.html`
- Shared theme in `style.css` (maroon + cream, Tiro Bangla / Hind Siliguri type)
- `books.js` reads live from Firestore's `books` collection (same one `admin.html` writes to) — books added/edited/deleted in the admin panel show up on the homepage and detail page automatically. If Firestore isn't set up yet, or the `books` collection is empty, it falls back to **18 placeholder books** (6 each across বিজ্ঞান / উপন্যাস / কবিতা) so the site still works with zero setup
- `decor.js` works the same way for the **Home Decor** section, reading from a separate `decorItems` Firestore collection (written to by `admin-decor.html`), with its own small placeholder catalog as a zero-setup fallback. Home Decor still lives on the homepage — only its shortcut link was removed from the top navbar to keep the nav compact
- Homepage (`index.html`) shows book genre shelves first, then a "Home Decor" section — plus one search box that searches across **both** catalogs at once
- One shared cart → checkout → order flow (books and decor items can sit in the same cart, same order), wired to localStorage + Firestore + EmailJS
- Owner login, order dashboard (`dashboard.html`), and **two** admin panels — `admin.html` for books, `admin-decor.html` for Home Decor items — all Firestore-backed
- **Customer accounts (optional)** — `account.html` lets any visitor sign up / log in (email+password or Google), separate from the owner's `login.html`. Logging in is never required to browse or check out, but if a customer is logged in: their cart syncs to Firestore (carries over between devices) and their past orders are saved to their account
- **Customer dashboard** — `my-account.html`: profile card (avatar, name, email, Google/Email badge, member-since/last-login) + quick links to My Orders, Cart, Books, Home Decor. The top navbar shows "লগইন" when signed out, or a single "ড্যাশবোর্ড" link (→ `my-account.html`) when signed in
- `firestore.rules` — complete, ready to paste into the Firebase console (see below)

You can open `index.html` right now (e.g. via VS Code's Live Server, or `python3 -m http.server`) and browse/add-to-cart/checkout against the placeholder data — everything except the Firestore/EmailJS-backed steps in checkout, admin, and login will work immediately. Opening the file directly via `file://` (double-click) will **not** work — ES module imports are blocked by the browser over `file://`.

## What you still need to do

**1. Create the Firebase project** (new, dedicated to Novaris — not reused from Munan.hub)
   - [console.firebase.google.com](https://console.firebase.google.com) → Add project
   - Build → Firestore Database → Create database (production mode)
   - Build → Authentication → Sign-in method → enable **Email/Password** and **Google**
   - Authentication → Settings → Authorized domains → add your GitHub Pages domain (e.g. `novarisshelf.github.io`) — required for Google sign-in to work there
   - Authentication → Users → Add user → this is your one owner/admin login
   - Project settings → General → Your apps → Web app (`</>`) → copy the config object into `firebase-config.js` if it ever changes
   - Firestore → Rules → paste in the full contents of `firestore.rules`, **replace every `YOUR_OWNER_EMAIL` with your real owner login email**, → Publish

**2. Set up EmailJS** (emailjs.com)
   - Create an Email Service (e.g. connect your Gmail)
   - Create an Email Template with variables: `to_email`, `customer_name`, `customer_phone`, `customer_address`, `customer_email`, `order_items`, `order_total`
   - Copy your Service ID, Template ID, and Public Key into `checkout.js`
   - Set `OWNER_EMAIL` in `checkout.js` to your real email

**3. Firestore index for order history**
   - The first time someone visits `my-orders.html`, its Firestore query (orders for one customer, newest first) will likely fail with a console error containing a link like "Create the index in the Firebase console" — click that link once and Firestore builds it automatically (takes a minute or two). Only needed once per project.

**4. Update footer contact info**
   - `footer.js` currently has placeholder email, address, and WhatsApp number — swap in the real ones

**5. Add real books & decor items**
   - Once step 1 is done, log in at `login.html` → `admin.html` for books, `admin-decor.html` for Home Decor items (writes straight to Firestore)
   - `books.js` and `decor.js` already read from Firestore, so items appear automatically — no code change needed. Each catalog's placeholder items stop showing as soon as at least one real item exists in its collection

**6. Deploy**
   - This repo currently has **two** GitHub Pages workflows in `.github/workflows/` (`jekyll-gh-pages.yml` and `static.yml`) — both fire on every push and race each other. Delete `jekyll-gh-pages.yml` (this isn't a Jekyll site) and keep only `static.yml`, to avoid non-deterministic deploys

## Firestore Rules
`firestore.rules` in this repo is complete and covers every collection the app uses (`books`, `decorItems`, `customers`, `orders`). The only edit needed before publishing is swapping `YOUR_OWNER_EMAIL` for your real login email — search-and-replace all occurrences.

## Notes
- Cart persists in `localStorage` under the key `novaris_cart`, per page reload/session, until checkout or manual clear. Each cart line stores `{ itemId, itemType, title, price, qty }` — `itemType` is `'book'` or `'decor'`, which is what lets one cart hold both.
- If a customer is logged in, their cart is also saved to Firestore (`customers/{uid}.cart`) so it follows them to another device/browser. This is best-effort — if Firebase isn't reachable, the site quietly falls back to localStorage-only.
- Password-reset and resend-verification cooldowns (in `account.html`) are tracked in the browser's `localStorage`, not enforced server-side — there's no Cloud Functions in this stack. It's a courtesy limit, not a real rate limit.
- `dashboard.html`, `admin.html`, and `admin-decor.html` are all gated by `auth.js` (the single owner account). `my-orders.html` and `my-account.html` are gated separately by `customer-auth.js` (any signed-up, email-verified customer) — two independent login systems by design, since the owner and customers are different kinds of users. Note `dashboard.html` (owner's order dashboard) and `my-account.html` (customer's profile page) are unrelated despite the similar name.
- Cover images currently point to placeholder URLs (`placehold.co`) — replace with real cover URLs in `admin.html` (paste a link, e.g. an image committed to `assets/images/` in this repo, or any external image URL).
