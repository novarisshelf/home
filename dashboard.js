// dashboard.js
// Fetches orders from Firestore, newest first, for dashboard.html.
// Also lets the owner update an order's status and tracking link.

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function fetchOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * updates: { status?: 'pending'|'confirmed'|'on_the_way'|'delivered'|'cancelled', trackingLink?: string }
 */
export async function updateOrder(orderId, updates) {
  await updateDoc(doc(db, 'orders', orderId), updates);
}
