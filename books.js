// books.js
// Live book catalog — reads from Firestore (the same "books" collection that
// admin.html writes to), so books added/edited/deleted in the admin panel
// show up here automatically.
//
// If Firestore isn't reachable yet (e.g. firebase-config.js still has
// placeholder values, or the "books" collection is empty), this falls back
// to a small local placeholder catalog so index.html / book.html still work
// with zero setup. Once real books exist in Firestore, they take over.

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const PLACEHOLDER_BOOKS = [
  // ---------- বিজ্ঞান (Science) ----------
  {
    id: 'sci-01',
    title: 'মহাবিশ্বের গল্প',
    author: 'রফিক আহমেদ',
    pages: 212,
    currentPrice: 350,
    regularPrice: 420,
    description: 'মহাবিশ্বের জন্ম থেকে বর্তমান পর্যন্ত এক সহজবোধ্য বিজ্ঞানভিত্তিক ভ্রমণ। জ্যোতির্বিজ্ঞানের জটিল ধারণাগুলো সাধারণ পাঠকের জন্য সহজ ভাষায় তুলে ধরা হয়েছে।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'জ্ঞানকোষ প্রকাশনী',
    edition: '২য় সংস্করণ',
    bindingType: 'Paperback',
    paperType: 'White print'
  },
  {
    id: 'sci-02',
    title: 'কোয়ান্টাম রহস্য',
    author: 'সালমা বেগম',
    pages: 176,
    currentPrice: 300,
    description: 'কোয়ান্টাম বলবিদ্যার অদ্ভুত ও চমকপ্রদ জগৎ নিয়ে একটি প্রাথমিক পরিচিতিমূলক বই।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'sci-03',
    title: 'মস্তিষ্কের ভেতরে',
    author: 'তানভীর হোসেন',
    pages: 240,
    currentPrice: 380,
    regularPrice: 450,
    description: 'মানুষের মস্তিষ্ক কীভাবে চিন্তা করে, শেখে এবং স্মৃতি ধরে রাখে — স্নায়ুবিজ্ঞানের একটি প্রাঞ্জল ভূমিকা।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: false,
    publisher: 'দিগন্ত প্রকাশন',
    bindingType: 'Hardcover',
    paperType: 'White print'
  },
  {
    id: 'sci-04',
    title: 'জীববিজ্ঞানের বিস্ময়',
    author: 'নাজমুল ইসলাম',
    pages: 198,
    currentPrice: 320,
    description: 'কোষ থেকে বাস্তুতন্ত্র পর্যন্ত — জীবজগতের বিস্ময়কর দিকগুলোর সহজ পাঠ।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'জ্ঞানকোষ প্রকাশনী',
    edition: '১ম সংস্করণ',
    bindingType: 'Paperback',
    paperType: 'Newsprint'
  },
  {
    id: 'sci-05',
    title: 'আবহাওয়ার বিজ্ঞান',
    author: 'ফারহানা ইয়াসমিন',
    pages: 154,
    currentPrice: 260,
    regularPrice: 300,
    description: 'ঋতু বদল, ঘূর্ণিঝড় ও জলবায়ু পরিবর্তনের পেছনের বিজ্ঞান, উদাহরণসহ ব্যাখ্যা করা হয়েছে।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'sci-06',
    title: 'রোবটিক্সের ভবিষ্যৎ',
    author: 'আরিফুল করিম',
    pages: 220,
    currentPrice: 400,
    description: 'রোবটিক্স ও কৃত্রিম বুদ্ধিমত্তা কীভাবে আগামী দিনের পৃথিবী বদলে দেবে, তার একটি ঝরঝরে পরিচিতি।',
    genre: 'বিজ্ঞান',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'দিগন্ত প্রকাশন',
    edition: '৩য় সংস্করণ',
    bindingType: 'Hardcover',
    paperType: 'White print'
  },

  // ---------- উপন্যাস (Novel) ----------
  {
    id: 'nov-01',
    title: 'নীল আকাশের নিচে',
    author: 'শারমিন আক্তার',
    pages: 288,
    currentPrice: 420,
    regularPrice: 500,
    description: 'গ্রামীণ জীবনের প্রেক্ষাপটে এক তরুণীর স্বপ্ন আর সংগ্রামের গল্প।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: true,
    publisher: 'কথাবিতান',
    bindingType: 'Paperback',
    paperType: 'Newsprint'
  },
  {
    id: 'nov-02',
    title: 'ফেরার পথ',
    author: 'হাসান মজুমদার',
    pages: 312,
    currentPrice: 450,
    description: 'বহু বছর পর নিজের শহরে ফিরে আসা এক মানুষের স্মৃতি ও উপলব্ধির উপন্যাস।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: true,
    edition: '১ম সংস্করণ'
  },
  {
    id: 'nov-03',
    title: 'শেষ চিঠি',
    author: 'রুবিনা সুলতানা',
    pages: 176,
    currentPrice: 280,
    regularPrice: 340,
    description: 'একটি অসম্পূর্ণ চিঠি ঘিরে গড়ে ওঠা পারিবারিক রহস্য ও আবেগের গল্প।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: true,
    publisher: 'কথাবিতান',
    bindingType: 'Paperback',
    paperType: 'White print'
  },
  {
    id: 'nov-04',
    title: 'মেঘের ওপারে',
    author: 'কামরুল আলম',
    pages: 264,
    currentPrice: 400,
    description: 'পাহাড়ি শহরে একলা থাকা এক লেখকের চোখে দেখা জীবনের গল্প।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: false
  },
  {
    id: 'nov-05',
    title: 'একটি নদীর গল্প',
    author: 'নাসরিন চৌধুরী',
    pages: 340,
    currentPrice: 480,
    regularPrice: 560,
    description: 'একটি নদীপাড়ের গ্রামের তিন প্রজন্মের বদলে যাওয়া জীবনযাত্রার আখ্যান।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: true,
    publisher: 'শব্দনীড়',
    edition: '২য় সংস্করণ',
    bindingType: 'Hardcover',
    paperType: 'White print'
  },
  {
    id: 'nov-06',
    title: 'ছায়াপথের ঠিকানা',
    author: 'জাহিদ উদ্দিন',
    pages: 300,
    currentPrice: 430,
    description: 'শহরের বুকে হারিয়ে যাওয়া বন্ধুত্ব খুঁজে ফেরার এক মায়াবী উপন্যাস।',
    genre: 'উপন্যাস',
    coverImage: 'https://placehold.co/300x450/C9A227/2B2320?text=Novaris',
    inStock: true,
    publisher: 'শব্দনীড়',
    bindingType: 'Paperback',
    paperType: 'Newsprint'
  },

  // ---------- কবিতা (Poetry) ----------
  {
    id: 'poe-01',
    title: 'বৃষ্টির খাতা',
    author: 'মিজানুর ইসলাম',
    pages: 96,
    currentPrice: 200,
    regularPrice: 250,
    description: 'বর্ষা, বিরহ আর স্মৃতিকে ঘিরে লেখা স্বল্প ও গভীর কবিতার সংকলন।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'ছন্দকথা',
    bindingType: 'Paperback',
    paperType: 'Newsprint'
  },
  {
    id: 'poe-02',
    title: 'শব্দের নদী',
    author: 'শিরিন আক্তার',
    pages: 112,
    currentPrice: 220,
    description: 'দৈনন্দিন জীবনের ছোট ছোট মুহূর্ত নিয়ে লেখা সহজ ভাষার কবিতাগুচ্ছ।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'poe-03',
    title: 'ভোরের কবিতা',
    author: 'কবির হোসেন',
    pages: 88,
    currentPrice: 180,
    regularPrice: 220,
    description: 'নতুন দিনের আশা আর সম্ভাবনাকে ঘিরে লেখা স্নিগ্ধ কবিতার বই।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'ছন্দকথা',
    edition: '১ম সংস্করণ',
    bindingType: 'Paperback',
    paperType: 'White print'
  },
  {
    id: 'poe-04',
    title: 'নিঃশব্দ সংলাপ',
    author: 'তানজিলা বেগম',
    pages: 104,
    currentPrice: 210,
    description: 'নিঃসঙ্গতা ও আত্ম-অনুসন্ধানের সুরে বাঁধা কবিতার একটি সংকলন।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: false
  },
  {
    id: 'poe-05',
    title: 'জোছনার খেরোখাতা',
    author: 'রোকসানা ইয়াসমিন',
    pages: 120,
    currentPrice: 240,
    regularPrice: 280,
    description: 'চাঁদনি রাত আর গ্রামবাংলার প্রকৃতিকে ঘিরে লেখা রোমান্টিক কবিতার বই।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'শব্দনীড়',
    bindingType: 'Hardcover',
    paperType: 'White print'
  },
  {
    id: 'poe-06',
    title: 'পথের কবিতা',
    author: 'মাহবুব আলম',
    pages: 100,
    currentPrice: 190,
    description: 'যাত্রা, পথ আর প্রতীক্ষার অনুভূতি নিয়ে লেখা ছোট ছোট কবিতার সংকলন।',
    genre: 'কবিতা',
    coverImage: 'https://placehold.co/300x450/2B2320/FAF6F0?text=Novaris',
    inStock: true,
    publisher: 'ছন্দকথা',
    paperType: 'Newsprint'
  }
];

/** All books, live from Firestore (falls back to placeholders — see notes above). */
let cachedBooks = null;
let cachedBooksPromise = null;

export async function getAllBooks() {
  if (cachedBooks) return cachedBooks;
  if (!cachedBooksPromise) cachedBooksPromise = fetchBooksWithFallback();
  cachedBooks = await cachedBooksPromise;
  return cachedBooks;
}

async function fetchBooksWithFallback() {
  try {
    const snapshot = await getDocs(collection(db, 'books'));
    const liveBooks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return liveBooks.length > 0 ? liveBooks : PLACEHOLDER_BOOKS;
  } catch (err) {
    console.warn('Could not load books from Firestore, showing placeholder catalog:', err);
    return PLACEHOLDER_BOOKS;
  }
}

/** Single book by id, or null if not found. Checks the live/placeholder cache first, then Firestore directly. */
export async function getBookById(id) {
  const books = await getAllBooks();
  const fromCache = books.find((b) => b.id === id);
  if (fromCache) return fromCache;

  // Not in the cached list (e.g. cache came from placeholders) — try Firestore directly.
  try {
    const snap = await getDoc(doc(db, 'books', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
}

/** Unique genres from a given list of books, in the order they first appear. */
export function getGenres(books) {
  return [...new Set(books.map((b) => b.genre))];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** `count` random books from a given genre, out of a supplied books list (re-shuffled on every call). */
export function getRandomBooksByGenre(books, genre, count) {
  const genreBooks = books.filter((b) => b.genre === genre);
  return shuffle(genreBooks).slice(0, count);
}

/** Builds a clickable <a class="book-card"> element linking to book.html?id=... */
export function createBookCard(book) {
  const card = document.createElement('a');
  card.href = `book.html?id=${encodeURIComponent(book.id)}`;
  card.className = 'book-card';
  card.setAttribute('aria-label', `${book.title} — ${book.author}`);

  const hasDiscount = book.regularPrice && book.regularPrice > book.currentPrice;

  card.innerHTML = `
    <div class="book-card-cover-wrap">
      <img class="book-card-cover" src="${book.coverImage}" alt="${book.title}" loading="lazy">
      ${!book.inStock ? '<span class="badge-outofstock">স্টক নেই</span>' : ''}
    </div>
    <h3 class="book-card-title">${book.title}</h3>
    <p class="book-card-author">${book.author}</p>
    <p class="book-card-price">
      <span class="price-current">৳${book.currentPrice}</span>
      ${hasDiscount ? `<span class="price-regular">৳${book.regularPrice}</span>` : ''}
    </p>
  `;
  return card;
}
