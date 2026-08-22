// cover-art.js
// Generates a branded, book/product-cover-style placeholder as an inline SVG
// data URI — used until a real cover photo is uploaded via the admin panel.
//
// Renders the title (wrapped across lines) and a small label, in the same
// Bangla-capable serif used across the site, on a soft two-tone panel with a
// thin spine rule down the left edge. This reads as an intentional editorial
// cover rather than a generic gray placeholder box, and needs no network
// request or external service (unlike placehold.co), so it always renders.

const PALETTES = {
  maroon:   { bg: '#7A1F2B', bg2: '#5E1620', ink: '#FAF6F0', spine: '#C9A227' },
  gold:     { bg: '#C9A227', bg2: '#A9871C', ink: '#2B2320', spine: '#7A1F2B' },
  charcoal: { bg: '#2B2320', bg2: '#1B1512', ink: '#FAF6F0', spine: '#C9A227' },
  clay:     { bg: '#A9871C', bg2: '#8A6E16', ink: '#FFFDF9', spine: '#7A1F2B' }
};

/** Greedy word-wrap for a title into at most `maxLines` lines of ~`maxChars` characters. */
function wrapTitle(title, maxChars = 12, maxLines = 3) {
  const words = title.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
    if (lines.length === maxLines - 1 && current.length > maxChars) {
      lines.push(current.slice(0, maxChars - 1) + '…');
      current = '';
      break;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds a data: URI SVG cover.
 * @param {string} title - main line(s), e.g. book title or item name
 * @param {string} subtitle - small line under the title, e.g. author or category
 * @param {'maroon'|'gold'|'charcoal'|'clay'} palette
 */
export function generateCoverArt(title, subtitle, palette = 'maroon') {
  const p = PALETTES[palette] || PALETTES.maroon;
  const W = 300, H = 450;
  const lines = wrapTitle(title, 11, 4);
  const lineHeight = 34;
  const blockHeight = lines.length * lineHeight;
  const startY = (H - blockHeight) / 2 + 60;

  const titleTspans = lines
    .map((line, i) => `<tspan x="${W / 2}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.bg}"/>
      <stop offset="1" stop-color="${p.bg2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="8" height="${H}" fill="${p.spine}"/>
  <rect x="28" y="36" width="36" height="3" fill="${p.spine}" opacity="0.9"/>
  <text fill="${p.ink}" font-family="Tiro Bangla, Noto Serif Bengali, Georgia, serif" font-size="26" text-anchor="middle" font-weight="500">${titleTspans}</text>
  <text x="${W / 2}" y="${H - 34}" fill="${p.ink}" fill-opacity="0.78" font-family="Hind Siliguri, Noto Sans Bengali, sans-serif" font-size="15" text-anchor="middle">${escapeXml(subtitle || '')}</text>
  <rect x="28" y="${H - 56}" width="36" height="2" fill="${p.spine}" opacity="0.7"/>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
