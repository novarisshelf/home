// whatsapp-float.js
// A floating, draggable WhatsApp button shown on every page.
//
// - Click (without dragging) opens a WhatsApp chat to the shop's number.
// - Drag to reposition anywhere on screen.
// - Drag it off the edge of the screen to dismiss it — it comes back on its
//   own after 5 minutes, or immediately on the next page load/reload
//   (this state is intentionally NOT persisted anywhere, so a reload
//   always shows it fresh).

const WHATSAPP_NUMBER = '8801732410353'; // same number as footer.js
const HIDE_DURATION_MS = 5 * 60 * 1000;
const DRAG_THRESHOLD_PX = 6;

function init() {
  if (document.querySelector('.wa-float-wrap')) return; // don't double-inject

  const wrap = document.createElement('div');
  wrap.className = 'wa-float-wrap';
  wrap.innerHTML = `
    <div class="wa-float-ring"></div>
    <button type="button" class="wa-float-btn" aria-label="WhatsApp এ মেসেজ করুন">
      <i class="fa-brands fa-whatsapp"></i>
    </button>
  `;
  document.body.appendChild(wrap);

  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;
  let dragging = false;
  let moved = false;
  let hideTimer = null;

  function show() {
    wrap.style.display = '';
  }

  function hideFor5Min() {
    wrap.style.display = 'none';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(show, HIDE_DURATION_MS);
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return; // left click / touch only
    dragging = true;
    moved = false;
    wrap.classList.add('dragging');

    const rect = wrap.getBoundingClientRect();
    originLeft = rect.left;
    originTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;

    // Switch from right/bottom anchoring to left/top so dragging tracks the cursor directly.
    wrap.style.left = `${originLeft}px`;
    wrap.style.top = `${originTop}px`;
    wrap.style.right = 'auto';
    wrap.style.bottom = 'auto';

    try { wrap.setPointerCapture(e.pointerId); } catch {}
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) moved = true;
    wrap.style.left = `${originLeft + dx}px`;
    wrap.style.top = `${originTop + dy}px`;
  }

  function onPointerUp() {
    if (!dragging) return;
    dragging = false;
    wrap.classList.remove('dragging');

    if (!moved) {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank', 'noopener');
      return;
    }

    const rect = wrap.getBoundingClientRect();
    const offScreen =
      rect.left < -10 ||
      rect.top < -10 ||
      rect.right > window.innerWidth + 10 ||
      rect.bottom > window.innerHeight + 10;

    if (offScreen) {
      hideFor5Min();
      return;
    }

    // Stayed on screen — just clamp it fully into view.
    const clampedLeft = Math.min(Math.max(rect.left, 4), window.innerWidth - rect.width - 4);
    const clampedTop = Math.min(Math.max(rect.top, 4), window.innerHeight - rect.height - 4);
    wrap.style.left = `${clampedLeft}px`;
    wrap.style.top = `${clampedTop}px`;
  }

  wrap.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
