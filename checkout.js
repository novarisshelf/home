// checkout.js
// On "Place Order": 1) email the order via EmailJS  2) save it to Firestore
// 3) clear the local cart  4) let cart.html show the confirmation message.
//
// TODO: create an EmailJS account (emailjs.com) → Email Service + Email Template,
// then paste your Service ID / Template ID / Public Key below. The template's
// variables must match the keys sent in templateParams further down.

import { db } from './firebase-config.js';
import { auth } from './firebase-config.js';
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getCart, getCartTotal, clearCart } from './cart.js';

const EMAILJS_SERVICE_ID = 'Orderinfo';
const EMAILJS_TEMPLATE_ID = 'template_o6asc2f';
const EMAILJS_PUBLIC_KEY = 'R-alEt5ko4W0XtxZJ';
const OWNER_EMAIL = 'novarisshelf@gmail.com';

if (typeof emailjs !== 'undefined') {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

/**
 * customer: { name, phone, address, email }
 * Throws Error('EMPTY_CART') if there's nothing to order.
 */
export async function submitOrder(customer) {
  const items = getCart();
  if (items.length === 0) throw new Error('EMPTY_CART');

  const totalPrice = getCartTotal();
  const orderData = {
    customerName: customer.name,
    phone: customer.phone,
    address: customer.address,
    email: customer.email || '',
    items,
    totalPrice,
    createdAt: serverTimestamp(),
    status: 'pending',
    // Logged-in customers get this order attached to their account so it
    // shows up in my-orders.html. Guests (not logged in) get null — their
    // order still goes to the owner dashboard as before, just without a
    // personal history link.
    customerUid: auth.currentUser && auth.currentUser.emailVerified ? auth.currentUser.uid : null
  };

  const itemsSummary = items
    .map((i) => `${i.title} × ${i.qty} — ৳${i.price * i.qty}`)
    .join('\n');

  if (typeof emailjs !== 'undefined') {
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: OWNER_EMAIL,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_email: customer.email || 'দেওয়া হয়নি',
        order_items: itemsSummary,
        order_total: `৳${totalPrice}`
      });
    } catch (err) {
      // Don't block the order over a flaky email — it's still saved to Firestore below.
      console.error('EmailJS send failed:', err);
    }
  }

  await addDoc(collection(db, 'orders'), orderData);
  clearCart();
  return orderData;
}
