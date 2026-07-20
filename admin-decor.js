// js/admin-decor.js
// Firestore CRUD for the Home Decor catalog (Hobby & Collectibles + ঘর সাজানোর
// জিনিস). Mirrors js/admin.js's pattern exactly, but writes to the separate
// "decorItems" collection instead of "books".

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function fetchDecorItemsLive() {
  const q = query(collection(db, 'decorItems'), orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addDecorItem(itemData) {
  return addDoc(collection(db, 'decorItems'), itemData);
}

export function updateDecorItem(id, itemData) {
  // Same "clear the discount" fix as js/admin.js: null means "remove the
  // field in Firestore" rather than "write null" or leave the old value.
  const data = { ...itemData };
  if (data.regularPrice === null) {
    data.regularPrice = deleteField();
  }
  return updateDoc(doc(db, 'decorItems', id), data);
}

export function deleteDecorItem(id) {
  return deleteDoc(doc(db, 'decorItems', id));
}
