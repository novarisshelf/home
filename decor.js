// decor.js
// Live catalog for the "Home Decor" section — two categories:
// "Hobby & Collectibles" and "ঘর সাজানোর জিনিস" (home decoration items).
// Reads from Firestore's "decorItems" collection (a separate collection from
// "books", written to by admin-decor.html / admin-decor.js).
//
// Same live/fallback pattern as books.js: if Firestore isn't reachable
// yet, or "decorItems" is empty, a small local placeholder catalog is used
// instead so the Home Decor section still works with zero setup.

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const PLACEHOLDER_DECOR_ITEMS = [
  // ---------- Hobby & Collectibles ----------
  {
    id: 'hob-01',
    title: 'মিনিয়েচার রিকশা মডেল',
    category: 'Hobby & Collectibles',
    material: 'কাঠ ও ধাতু',
    dimensions: '১৫ x ৬ x ৮ সেমি',
    currentPrice: 450,
    regularPrice: 550,
    description: 'হাতে তৈরি ঢাকার রিকশার ছোট্ট প্রতিরূপ, শোকেসে রাখার জন্য চমৎকার একটি সংগ্রহযোগ্য বস্তু।',
    coverImage: 'https://placehold.co/300x450/A9871C/FFFDF9?text=Novaris',
    inStock: true
  },
  {
    id: 'hob-02',
    title: 'ভিন্টেজ ডাকটিকেট অ্যালবাম',
    category: 'Hobby & Collectibles',
    material: 'কাগজ ও চামড়া বাঁধাই',
    dimensions: '২৫ x ২০ সেমি',
    currentPrice: 380,
    description: 'পুরনো দিনের ডাকটিকেট সংরক্ষণের জন্য চামড়ায় বাঁধানো অ্যালবাম, সংগ্রাহকদের জন্য আদর্শ।',
    coverImage: 'https://placehold.co/300x450/A9871C/FFFDF9?text=Novaris',
    inStock: true
  },
  {
    id: 'hob-03',
    title: 'ব্রাস কম্পাস (এন্টিক)',
    category: 'Hobby & Collectibles',
    material: 'পিতল',
    dimensions: '৬ সেমি ব্যাস',
    currentPrice: 320,
    regularPrice: 400,
    description: 'পুরনো নকশার পিতলের কম্পাস, ডেস্কে সাজিয়ে রাখার মতো একটি চমৎকার সংগ্রহ।',
    coverImage: 'https://placehold.co/300x450/A9871C/FFFDF9?text=Novaris',
    inStock: false
  },
  {
    id: 'hob-04',
    title: 'পোস্টকার্ড সংগ্রহ সেট',
    category: 'Hobby & Collectibles',
    material: 'কাগজ',
    dimensions: '১৫ x ১০ সেমি (প্রতিটি)',
    currentPrice: 250,
    description: 'পুরনো ঢাকার দৃশ্য নিয়ে ২০টি পোস্টকার্ডের একটি সংগ্রহযোগ্য সেট।',
    coverImage: 'https://placehold.co/300x450/A9871C/FFFDF9?text=Novaris',
    inStock: true
  },

  // ---------- ঘর সাজানোর জিনিস (Home Decor) ----------
  {
    id: 'dec-01',
    title: 'হাতে বোনা পাটের ম্যাট',
    category: 'ঘর সাজানোর জিনিস',
    material: 'পাট',
    dimensions: '৯০ x ৬০ সেমি',
    currentPrice: 550,
    regularPrice: 650,
    description: 'ঘরের মেঝেতে গ্রামীণ ছোঁয়া আনতে হাতে বোনা পাটের ম্যাট।',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'dec-02',
    title: 'সিরামিক ফুলদানি',
    category: 'ঘর সাজানোর জিনিস',
    material: 'সিরামিক',
    dimensions: '৩০ সেমি উচ্চতা',
    currentPrice: 480,
    description: 'হাতে আঁকা নকশার সিরামিক ফুলদানি, ড্রয়িং রুম সাজাতে উপযুক্ত।',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'dec-03',
    title: 'কাঠের দেয়াল ঘড়ি',
    category: 'ঘর সাজানোর জিনিস',
    material: 'সেগুন কাঠ',
    dimensions: '৩৫ সেমি ব্যাস',
    currentPrice: 720,
    regularPrice: 850,
    description: 'হাতে খোদাই করা নকশার কাঠের দেয়াল ঘড়ি, দেখতে ক্ল্যাসিক ও টেকসই।',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: true
  },
  {
    id: 'dec-04',
    title: 'নকশিকাঁথা কুশন কভার',
    category: 'ঘর সাজানোর জিনিস',
    material: 'সুতি কাপড়',
    dimensions: '৪০ x ৪০ সেমি',
    currentPrice: 300,
    description: 'ঐতিহ্যবাহী নকশিকাঁথার সেলাইয়ে সাজানো কুশন কভার, সোফাকে দেয় বাঙালি ছোঁয়া।',
    coverImage: 'https://placehold.co/300x450/7A1F2B/FAF6F0?text=Novaris',
    inStock: false
  }
];

let cachedDecorItems = null;
let cachedDecorItemsPromise = null;

/** All decor items, live from Firestore (falls back to placeholders — see notes above). */
export async function getAllDecorItems() {
  if (cachedDecorItems) return cachedDecorItems;
  if (!cachedDecorItemsPromise) cachedDecorItemsPromise = fetchDecorItemsWithFallback();
  cachedDecorItems = await cachedDecorItemsPromise;
  return cachedDecorItems;
}

async function fetchDecorItemsWithFallback() {
  try {
    const snapshot = await getDocs(collection(db, 'decorItems'));
    const liveItems = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    return liveItems.length > 0 ? liveItems : PLACEHOLDER_DECOR_ITEMS;
  } catch (err) {
    console.warn('Could not load decor items from Firestore, showing placeholder catalog:', err);
    return PLACEHOLDER_DECOR_ITEMS;
  }
}

/** Single decor item by id, or null if not found. */
export async function getDecorItemById(id) {
  const items = await getAllDecorItems();
  const fromCache = items.find((i) => i.id === id);
  if (fromCache) return fromCache;

  try {
    const snap = await getDoc(doc(db, 'decorItems', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch {
    return null;
  }
}

/** Unique categories from a given list of decor items, in first-appearance order. */
export function getDecorCategories(items) {
  return [...new Set(items.map((i) => i.category))];
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** `count` random items from a given category, out of a supplied items list. */
export function getRandomDecorItemsByCategory(items, category, count) {
  const inCategory = items.filter((i) => i.category === category);
  return shuffle(inCategory).slice(0, count);
}

/** Builds a clickable <a class="book-card"> element linking to decor-item.html?id=... */
export function createDecorCard(item) {
  const card = document.createElement('a');
  card.href = `decor-item.html?id=${encodeURIComponent(item.id)}`;
  card.className = 'book-card';
  card.setAttribute('aria-label', `${item.title} — ${item.category}`);

  const hasDiscount = item.regularPrice && item.regularPrice > item.currentPrice;

  card.innerHTML = `
    <div class="book-card-cover-wrap">
      <img class="book-card-cover" src="${item.coverImage}" alt="${item.title}" loading="lazy">
      ${!item.inStock ? '<span class="badge-outofstock">স্টক নেই</span>' : ''}
    </div>
    <h3 class="book-card-title">${item.title}</h3>
    <p class="book-card-author">${item.material || item.category}</p>
    <p class="book-card-price">
      <span class="price-current">৳${item.currentPrice}</span>
      ${hasDiscount ? `<span class="price-regular">৳${item.regularPrice}</span>` : ''}
    </p>
  `;
  return card;
}
