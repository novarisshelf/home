# Novaris — নতুন পেজ বানানোর গাইড

এই সাইটের প্রতিটা page একই pattern follow করে। নতুন page বানানোর সময় নিচের ধাপগুলো মেনে চললে সব page একই রকম দেখাবে ও কাজ করবে।

প্রথমে ঠিক করুন: এটা **customer-facing page** (যেমন index/book/cart-এর মতো) নাকি **owner/admin page** (dashboard/admin-এর মতো)। দুটোর navbar আলাদা।

---

## ধাপ ১ — `<head>` (সব page-এ হুবহু একই, শুধু title বদলাবে)

```html
<!DOCTYPE html>
<html lang="bn">
<head>
  <script>
    try {
      if (localStorage.getItem('novaris_theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  </script>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novaris — [এখানে পেজের নাম]</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
  <script type="module" src="i18n.js"></script>
```

`<script>` স্নিপেটটা বাদ দেবেন না — এটা না থাকলে dark theme পছন্দ করা visitor-রা প্রথমে এক সেকেন্ডের জন্য light theme দেখে ফেলবে (flash)।

---

## ধাপ ২ — Navbar

### (ক) Customer page হলে:

```html
  <nav class="navbar">
    <div class="navbar-inner">
      <a href="index.html" class="navbar-brand">Novaris</a>
      <div class="navbar-links">
        <span id="customer-nav-slot" class="navbar-account"></span>
        <a href="cart.html" class="navbar-cart" data-i18n-aria="nav_cart" aria-label="কার্ট">
          <i class="fa-solid fa-cart-shopping"></i>
          <span class="cart-badge">0</span>
        </a>
      </div>
    </div>
  </nav>
```

`#customer-nav-slot` স্প্যানটা বসিয়ে দিলেই `customer-nav.js` নিজে থেকে লগইন/ড্যাশবোর্ড লিংক বসিয়ে দেবে — এখানে হাত দেওয়ার দরকার নেই।

### (খ) Owner/admin page হলে:

```html
  <div class="owner-bar">
    <div class="owner-bar-inner">
      <div class="owner-bar-links">
        <a href="dashboard.html" data-i18n="owner_orders">অর্ডার</a>
        <a href="admin.html" data-i18n="owner_manage_books">বই পরিচালনা</a>
        <a href="admin-decor.html" data-i18n="owner_manage_decor">ডেকর পরিচালনা</a>
        <a href="[নতুন-পেজ.html]" class="active">[নতুন লিংকের নাম]</a>
      </div>
      <button class="owner-logout" id="logout-btn"><i class="fa-solid fa-right-from-bracket"></i> <span data-i18n="owner_logout">লগআউট</span></button>
    </div>
  </div>
```

⚠️ এই `owner-bar-links` block-টা **`dashboard.html`, `admin.html`, `admin-decor.html` — তিনটাতেই আলাদাভাবে বসানো আছে** (shared component না)। তাই নতুন owner page বানালে এই ৩টা ফাইলেই সেই page-এর link যোগ করতে হবে, আর নতুন page নিজেও ওই একই লিস্ট (তার নিজের link-এ `class="active"` দিয়ে) রাখবে।

---

## ধাপ ৩ — Page content (`.container` এর ভেতরে)

```html
  <div class="container">
    <h1 data-i18n="আপনার_নতুন_i18n_key">পেজের টাইটেল</h1>
    <!-- এখানে আপনার content -->
  </div>
```

সাধারণ যেসব CSS class আগে থেকেই আছে (নতুন CSS লেখা লাগবে না):
- `.card` — সাদা/থিম-aware বক্স, shadow সহ
- `.btn.btn-primary`, `.btn.btn-outline`, `.btn.btn-danger` — বাটন
- `.form-group`, `.form-label`, `.form-input`, `.form-select` — ফর্ম ফিল্ড
- `.empty-state` — "কিছু পাওয়া যায়নি" ধরনের খালি অবস্থা
- `.loading-state` — লোডিং টেক্সট
- `.msg-bar.success` / `.msg-bar.error` / `.msg-bar.loading` — status ব্যানার

---

## ধাপ ৪ — Footer + shared scripts (page-এর একদম শেষে, সব page-এ একই)

```html
  <div id="site-footer"></div>

  <script type="module">
    // এখানে আপনার page-specific JS
  </script>
  <script type="module" src="footer.js"></script>
  <script type="module" src="theme.js"></script>
  <script type="module" src="whatsapp-float.js"></script>
</body>
</html>
```

এই ৩টা script tag বাদ দেবেন না — footer, personal dark-theme preference, আর floating WhatsApp বাটন — এগুলো প্রতিটা page-এ লাগে।

---

## ধাপ ৫ — Firestore data লাগলে

```js
import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
```

- বই/ডেকরের মতো **read-heavy catalog data** হলে `data-cache.js`-এর `cachedFetch()` ব্যবহার করুন (books.js/decor.js দেখুন উদাহরণ হিসেবে) — এতে page navigation-এ বারবার লোড হবে না।
- Order/profile-এর মতো **সবসময় fresh থাকা দরকার এমন data**-এ cache ব্যবহার করবেন না।

---

## ধাপ ৬ — Translation (i18n.js)

1. নতুন key `i18n.js`-এর **দুই জায়গায়** যোগ করুন — `bn:` ব্লকে আর `en:` ব্লকে, একই key নামে।
2. HTML-এ static text হলে: `<span data-i18n="my_key">ডিফল্ট টেক্সট</span>`
3. JS দিয়ে বানানো dynamic text হলে: `import { t } from './i18n.js'` করে `t('my_key')` কল করুন।

---

## ধাপ ৭ — নতুন page-টাকে navigation-এ যুক্ত করা

| Page কোথায় দেখাতে চান | কী করবেন |
|---|---|
| Owner-এর জন্য (dashboard-এর পাশে) | `owner-bar-links`-এ link যোগ করুন — `dashboard.html`, `admin.html`, `admin-decor.html` **তিনটাতেই** |
| Customer account-এর "দ্রুত অ্যাক্সেস" সেকশনে | `my-account.html`-এ `.quick-card` link যোগ করুন (Orders/Cart/Books/Decor-এর মতো ৪টা আছে, ৫ম টা এভাবেই যোগ করুন) |
| সবার জন্য মূল navbar-এ | `index.html`-সহ যেসব customer page-এ navbar আছে, সেখানে `.navbar-links`-এ নতুন `<a>` যোগ করুন |
| Category/genre-ভিত্তিক listing | নতুন file বানাবেন না — `genre.html?type=...&key=...` এই একই page reuse হয় সব category-র জন্য |

---

## চেকলিস্ট (কপি-পেস্ট করার আগে শেষবার মিলিয়ে নিন)

- [ ] Theme flash-prevention script `<head>`-এ আছে
- [ ] `i18n.js` module script সবার আগে load হচ্ছে
- [ ] সঠিক navbar (customer বা owner) বসানো হয়েছে
- [ ] Owner page হলে ৩টা owner file-এই link বসানো হয়েছে
- [ ] Content `.container`-এর ভেতরে, existing CSS class ব্যবহার করে
- [ ] `footer.js`, `theme.js`, `whatsapp-float.js` — তিনটাই শেষে আছে
- [ ] নতুন টেক্সট `data-i18n` দিয়ে চিহ্নিত, আর key `i18n.js`-এর bn + en দুই জায়গায় আছে
- [ ] প্রয়োজনমতো navigation-এ (owner-bar / quick-access / navbar) link যোগ করা হয়েছে
