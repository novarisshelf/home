// js/admin.js
// Firestore CRUD for the live book catalog — this is the "switch from static
// array to live Firestore" step. Once real books exist here, update
// js/books.js to read from Firestore too (see the TODO at the top of that file).

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

export async function fetchBooksLive() {
  const q = query(collection(db, 'books'), orderBy('title'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function addBook(bookData) {
  return addDoc(collection(db, 'books'), bookData);
}

export function updateBook(id, bookData) {
  // If the caller explicitly set regularPrice to null (meaning "clear the
  // discount"), tell Firestore to remove the field entirely instead of
  // writing `null` or silently leaving the old value in place.
  const data = { ...bookData };
  if (data.regularPrice === null) {
    data.regularPrice = deleteField();
  }
  return updateDoc(doc(db, 'books', id), data);
}

export function deleteBook(id) {
  return deleteDoc(doc(db, 'books', id));
}
