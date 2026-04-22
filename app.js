// ===== APP.JS — Grail Plug Supply =====
document.addEventListener('DOMContentLoaded', () => {
  // --- Loader ---
  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('hidden'), 1500);

  // --- Menu Toggle ---
  const toggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // --- State ---
  let activeSize = 'all';
  let activeCategory = 'all';

  // --- Render Product Card ---
  function createCard(p) {
    const isSold = p.status === 'sold';
    return `
      <div class="product-card fade-in" data-id="${p.id}" data-size="${p.size}" data-category="${p.category}">
        <div class="product-card-img">
          ${isSold ? '<span class="product-badge badge-sold">SOLD</span>' : '<span class="product-badge badge-new">AVAILABLE</span>'}
          <span class="product-size-badge">${p.sizeLabel}</span>
          <img src="${p.image}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-card-info">
          <div class="product-brand">${p.brand}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-meta">
            <span class="product-price ${isSold ? 'sold' : ''}">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="product-dm">${isSold ? 'SOLD OUT' : 'DM TO COP'}</span>
          </div>
        </div>
      </div>`;
  }

  // --- Render Grids ---
  function renderDrops() {
    const grid = document.getElementById('drops-grid');
    const drops = PRODUCTS.filter(p => p.status === 'available').slice(0, 4);
    grid.innerHTML = drops.map(createCard).join('');
    observeFadeIns(grid);
    attachCardClicks(grid);
  }

  function renderCollection() {
    const grid = document.getElementById('product-grid');
    const empty = document.getElementById('grid-empty');
    let filtered = PRODUCTS;
    if (activeSize !== 'all') filtered = filtered.filter(p => p.size === activeSize);
    if (activeCategory !== 'all') filtered = filtered.filter(p => p.category === activeCategory);
    if (filtered.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.innerHTML = filtered.map(createCard).join('');
      observeFadeIns(grid);
      attachCardClicks(grid);
    }
  }

  // --- Size Filter ---
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSize = btn.dataset.size;
      renderCollection();
    });
  });

  // --- Category Tabs ---
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      renderCollection();
    });
  });

  // --- Modal ---
  const modal = document.getElementById('product-modal');
  const modalImg = document.getElementById('modal-img');
  const modalInfo = document.getElementById('modal-info');
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');

  function openModal(product) {
    const isSold = product.status === 'sold';
    modalImg.src = product.image;
    modalImg.alt = product.name;
    const measHtml = Object.entries(product.measurements).map(
      ([k, v]) => `<div class="measurement"><span>${k}</span><span>${v}</span></div>`
    ).join('');

    modalInfo.innerHTML = `
      <div class="modal-brand">${product.brand}</div>
      <h3 class="modal-name">${product.name}</h3>
      <span class="modal-status ${isSold ? 'sold-out' : 'available'}">${isSold ? '🟧 SOLD OUT' : '🟢 AVAILABLE'}</span>
      <div class="modal-price ${isSold ? 'sold' : ''}">₹${product.price.toLocaleString('en-IN')}${!isSold ? ' + ship' : ''}</div>
      <div class="modal-measurements">
        <h4>MEASUREMENTS</h4>
        <div class="measurement-grid">${measHtml}</div>
      </div>
      <p class="modal-note">${product.desc}</p>
      ${!isSold ? `
        <div class="modal-cta">
          <a href="https://www.instagram.com/grail_plug.co/" target="_blank" class="btn btn-primary btn-lg">
            DM TO COP
          </a>
        </div>
      ` : '<div class="modal-cta"><button class="btn btn-primary btn-lg" style="background:var(--text-secondary);cursor:not-allowed;width:100%;justify-content:center" disabled>SOLD OUT</button></div>'}
      <p class="modal-note" style="margin-top:12px">Serious buyers only. Feel free to authenticate the piece before purchasing. DM for any questions or additional photos.</p>
    `;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  function attachCardClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const product = PRODUCTS.find(p => p.id === parseInt(card.dataset.id));
        if (product) openModal(product);
      });
    });
  }

  // --- Intersection Observer for fade-in ---
  function observeFadeIns(container) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    container.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // --- General fade-in for sections ---
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.section-header, .about-content, .about-visual, .contact-card').forEach(el => {
    el.classList.add('fade-in');
    sectionObserver.observe(el);
  });

  // --- Header scroll effect ---
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scroll = window.scrollY;
    if (scroll > 100) header.style.borderBottomColor = 'var(--border)';
    else header.style.borderBottomColor = 'transparent';
    lastScroll = scroll;
  });

  // --- Init ---
  renderDrops();
  renderCollection();
});
