// dashboard.js
// Fetches orders from Firestore, newest first, for dashboard.html.

import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function fetchOrders() {
  const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
