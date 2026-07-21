// footer.js
// Injects the shared footer into <div id="site-footer"></div> on every page.

function renderFooter() {
  const container = document.getElementById('site-footer');
  if (!container) return;

  const year = new Date().getFullYear();

  container.innerHTML = `
    <div class="footer-content">
      <p class="footer-brand">Novaris</p>
      <p class="footer-line"><i class="fa-solid fa-envelope"></i> novarisshelf@gmail.com</p>
      <p class="footer-line"><i class="fa-solid fa-location-dot"></i> রোড ২, ধানমন্ডি, ঢাকা</p>
      <p class="footer-line">
        <a href="tel:+8809658952399">
          <i class="fa-solid fa-phone"></i> +৮৮০ ৯৬৫৮৯৫২৩৯৯
        </a>
      </p>
      <p class="footer-line">
        <a href="https://wa.me/8801732410353" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp"></i> +৮৮০ ১৭৩২-৪১০৩৫৩
        </a>
      </p>
      <p class="footer-copy">© ${year} Novaris — সর্বস্বত্ব সংরক্ষিত</p>
    </div>
  `;
}

renderFooter();
