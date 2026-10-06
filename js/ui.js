/**
 * UI: kleine, herbruikbare helpers (DOM, escaping, templates, toasts, dialogen).
 */
const UI = (() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

  /* ---------- Afbeeldingen ---------- */

  const CATEGORY_COLORS = {
    Vega: ['#2dd4a0', '#0f766e'],
    Vlees: ['#ff7a59', '#b4321b'],
    Vis: ['#4cc9f0', '#1d4ed8'],
    Dessert: ['#f472b6', '#9d174d'],
    Soep: ['#fbbf24', '#b45309']
  };
  const DEFAULT_COLORS = ['#a78bfa', '#4c1d95'];

  /** SVG-placeholder (bord met bestek) in de kleur van de categorie. */
  const placeholderImage = (category = '') => {
    const [from, to] = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
      </linearGradient></defs>
      <rect width="400" height="260" fill="url(#g)"/>
      <g fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="6" stroke-linecap="round">
        <circle cx="200" cy="130" r="52"/><circle cx="200" cy="130" r="34" stroke-opacity=".5"/>
        <path d="M122 84v92M110 84v30a12 12 0 0 0 24 0V84M278 84c-14 8-20 28-20 46h20v46"/>
      </g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const recipeImageSrc = (recipe) => recipe.image || placeholderImage(recipe.category);

  // Een kapotte afbeelding valt automatisch terug op de placeholder (error bubbelt niet, dus capture).
  document.addEventListener('error', (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement) || img.dataset.fallback) return;
    img.dataset.fallback = 'true';
    img.src = placeholderImage(img.dataset.category);
  }, true);

  /** Leest een afbeelding, verkleint die en geeft een JPEG data-URL terug. */
  const readImageFile = (file, maxSize = 800) => new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Kies een afbeeldingsbestand (jpg, png of webp).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Het bestand kon niet worden gelezen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Deze afbeelding is ongeldig.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  /* ---------- Templates ---------- */

  const ratingMarkup = (rating) => {
    if (!rating) return '<span class="recipe-meta">Nog geen beoordeling</span>';
    return `<span class="stars" role="img" aria-label="${rating} van 5 sterren">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</span>`;
  };

  const statusBadge = (status) => {
    const type = status === RecipeStore.STATUS.published ? 'badge-success' : 'badge-muted';
    return `<span class="badge ${type}">${escapeHtml(status)}</span>`;
  };

  const recipeCard = (recipe) => `
    <article class="card recipe-card">
      <a class="recipe-link" href="recept-detail.html?id=${recipe.id}">
        <img class="recipe-img" src="${escapeHtml(recipeImageSrc(recipe))}" alt="" loading="lazy" data-category="${escapeHtml(recipe.category)}">
        <div class="recipe-info">
          <span class="badge badge-soft">${escapeHtml(recipe.category)}</span>
          <h3 class="recipe-title">${escapeHtml(recipe.title)}</h3>
          ${ratingMarkup(recipe.rating)}
          <p class="recipe-meta">${recipe.minutes} min</p>
        </div>
      </a>
    </article>`;

  /** `action` is kant-en-klare HTML die de aanroeper zelf heeft geëscaped. */
  const emptyState = ({ icon = '🍽️', title, text, action = '' }) => `
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">${icon}</span>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(text)}</p>
      ${action}
    </div>`;

  /* ---------- Feedback ---------- */

  const FLASH_KEY = 'ff_flash';

  const toast = (message, type = 'success') => {
    let stack = $('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      stack.setAttribute('role', 'status');
      stack.setAttribute('aria-live', 'polite');
      document.body.append(stack);
    }
    const item = document.createElement('div');
    item.className = `toast toast-${type}`;
    item.textContent = message;
    stack.append(item);
    setTimeout(() => item.remove(), 4000);
  };

  /** Bewaart een melding voor de volgende pagina (bijv. na opslaan en doorsturen). */
  const flash = (message, type = 'success') => {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message, type }));
  };

  const showFlash = () => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(FLASH_KEY));
      sessionStorage.removeItem(FLASH_KEY);
      if (stored?.message) toast(stored.message, stored.type);
    } catch {
      sessionStorage.removeItem(FLASH_KEY);
    }
  };

  const confirmDialog = (message, confirmLabel = 'Verwijderen') => new Promise((resolve) => {
    const dialog = document.createElement('dialog');
    dialog.className = 'dialog';
    dialog.innerHTML = `
      <form method="dialog">
        <p>${escapeHtml(message)}</p>
        <div class="dialog-actions">
          <button class="btn btn-ghost" value="cancel">Annuleren</button>
          <button class="btn btn-danger" value="ok">${escapeHtml(confirmLabel)}</button>
        </div>
      </form>`;
    dialog.addEventListener('close', () => {
      resolve(dialog.returnValue === 'ok');
      dialog.remove();
    });
    document.body.append(dialog);
    dialog.showModal();
  });

  return { $, $$, escapeHtml, placeholderImage, recipeImageSrc, readImageFile, ratingMarkup, statusBadge, recipeCard, emptyState, toast, flash, showFlash, confirmDialog };
})();
