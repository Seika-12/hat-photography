/* HAT Photography CMS bridge: loads JSON data, keeps the original Bootstrap layout. */
(() => {
  'use strict';
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const isJP = page.endsWith('-jp.html');
  const galleryNames = {
    'animal_photography': 'animal',
    'people_events': 'people',
    'landscape_photography': 'landscape',
    'drone_aerial_photography': 'drone'
  };
  const prefix = page.replace(/-jp\.html$|\.html$/i, '');
  const galleryKey = galleryNames[prefix];

  async function readJSON(url) {
    const response = await fetch(url, {cache: 'no-cache'});
    if (!response.ok) throw new Error('CMS data missing: ' + url + ' (' + response.status + ')');
    return response.json();
  }
  function text(sel, value) {
    if (typeof value !== 'string' || !value.trim()) return;
    const el = document.querySelector(sel);
    if (el) el.textContent = value;
  }
  function image(sel, value) {
    if (typeof value !== 'string' || !value) return;
    const el = document.querySelector(sel);
    if (el) el.src = value;
  }
  function background(sel, value, gradient) {
    if (typeof value !== 'string' || !value) return;
    const el = document.querySelector(sel);
    if (el) el.style.backgroundImage = `${gradient}, url(${JSON.stringify(value)})`;
  }
  function safeSocial(value, site) {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && (u.hostname === site || u.hostname === 'www.' + site) ? u.href : null;
    } catch { return null; }
  }

  async function setHome() {
    const english = await readJSON('/content/home.json');
    const copy = isJP ? await readJSON('/content/home-jp.json') : english;
    text('.hero h1', copy.title);
    text('.hero p', copy.description);
    text('#about p:nth-of-type(1)', copy.about_text);
    text('#about p:nth-of-type(2)', copy.about_second_text);
    image('#about img', english.about_image);
    background('.hero', english.hero_image, 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)');
    background('.contact', english.contact_image, 'linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.45))');

    // Bootstrap portfolio cards live in separate columns, so select in DOM order.
    const covers = [...document.querySelectorAll('#portfolio .portfolio-item img')];
    ['animal','people','landscape','drone'].forEach((key, idx) => {
      const value = english['portfolio_' + key];
      if (covers[idx] && value) covers[idx].src = value;
    });

    const serviceCards = [...document.querySelectorAll('#services .row > .col-md-4')];
    serviceCards.forEach((card, idx) => {
      const n = idx + 1;
      const h = card.querySelector('h5');
      const p = card.querySelector('p');
      if (h && typeof copy[`service_${n}_title`] === 'string' && copy[`service_${n}_title`].trim()) h.textContent = copy[`service_${n}_title`];
      if (p && typeof copy[`service_${n}_description`] === 'string' && copy[`service_${n}_description`].trim()) p.textContent = copy[`service_${n}_description`];
    });
    text('#contact h2', copy.contact_title);
    text('#contact p', copy.contact_text);
    const instagram = safeSocial(english.instagram_url, 'instagram.com');
    const youtube = safeSocial(english.youtube_url, 'youtube.com');
    if (instagram) document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = instagram);
    if (youtube) document.querySelectorAll('a[href*="youtube.com"]').forEach(a => a.href = youtube);
  }

  async function setGallery() {
    const data = await readJSON(`/content/galleries/${galleryKey}.json`);
    const language = isJP ? 'jp' : 'en';
    text('section.container.text-center.py-5 h1', data['title_' + language]);
    text('section.container.text-center.py-5 p', data['description_' + language]);
    if (!Array.isArray(data.images)) return;
    const grid = document.querySelector('section.container.pb-5 .row.g-3');
    if (!grid) return;
    const fragment = document.createDocumentFragment();
    data.images.forEach((entry, i) => {
      if (!entry || typeof entry.image !== 'string' || !entry.image.trim()) return;
      const col = document.createElement('div');
      col.className = 'col-6 col-lg-4';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-item d-block w-100 p-0 border-0 bg-transparent';
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#photoModal');
      button.dataset.image = entry.image;
      const ratio = document.createElement('div');
      ratio.className = 'ratio ratio-4x3';
      const img = document.createElement('img');
      img.className = 'gallery-image';
      img.src = entry.image;
      img.alt = entry.alt || `${galleryKey} photo ${i+1}`;
      ratio.append(img);
      button.append(ratio);
      button.addEventListener('click', () => {
        const modal = document.getElementById('modalImage');
        if (modal) { modal.src = entry.image; modal.alt = img.alt; }
      });
      col.append(button);
      fragment.append(col);
    });
    grid.replaceChildren(fragment);
  }

  (galleryKey ? setGallery() : setHome())
    .catch(error => console.error('HAT CMS:', error));
})();
