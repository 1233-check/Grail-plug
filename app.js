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

  // --- Apply Site Content from localStorage ---
  function applySiteContent() {
    const content = GrailData.getSiteContent();

    // Hero
    if (content.hero) {
      const h = content.hero;
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      set('hero-badge', h.badge);
      set('hero-line1', h.line1);
      set('hero-line2', h.line2);
      set('hero-line3', h.line3);
      set('hero-subtitle', h.subtitle);
      set('stat1-number', h.stat1Number);
      set('stat1-label', h.stat1Label);
      set('stat2-number', h.stat2Number);
      set('stat2-label', h.stat2Label);
      set('stat3-number', h.stat3Number);
      set('stat3-label', h.stat3Label);
    }

    // Drops
    if (content.drops) {
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      set('drops-tag', content.drops.tag);
      set('drops-title', content.drops.title);
      set('drops-desc', content.drops.desc);
    }

    // Collection
    if (content.collection) {
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      set('collection-tag', content.collection.tag);
      set('collection-title', content.collection.title);
      set('collection-desc', content.collection.desc);
    }

    // About
    if (content.about) {
      const a = content.about;
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };
      if (a.tag) { const el = document.getElementById('about-tag'); if (el) el.textContent = a.tag; }
      set('about-title', a.title);
      set('about-text1', a.text1);
      set('about-text2', a.text2);
    }

    // Contact
    if (content.contact) {
      const c = content.contact;
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      set('contact-tag', c.tag);
      set('contact-title', c.title);
      set('contact-desc', c.desc);
      set('contact-handle', c.igHandle);
      if (c.igUrl) {
        const btn = document.getElementById('contact-dm-btn');
        if (btn) btn.href = c.igUrl;
      }
    }

    // Footer
    if (content.footer) {
      const f = content.footer;
      const setHtml = (id, val) => { const el = document.getElementById(id); if (el && val) el.innerHTML = val; };
      setHtml('footer-tagline', f.tagline);
      const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
      set('footer-copyright', f.copyright);
      set('footer-bottom-text', f.bottomText);
    }

    // Reviews
    if (content.reviews && content.reviews.length) {
      const track = document.getElementById('reviews-track');
      if (track) {
        const items = content.reviews.map(r => `<span class="review-item">${r}</span>`).join('');
        track.innerHTML = items + items; // duplicate for seamless marquee
      }
    }
  }

  // --- Build Category Tabs Dynamically ---
  function buildCategoryTabs() {
    const container = document.getElementById('category-tabs');
    if (!container) return;
    const cats = GrailData.getCategories();
    container.innerHTML = '<button class="cat-tab active" data-category="all" id="cat-all">ALL</button>' +
      cats.map(c => `<button class="cat-tab" data-category="${c.id}" id="cat-${c.id}">${c.name.toUpperCase()}</button>`).join('');

    container.querySelectorAll('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = tab.dataset.category;
        renderCollection();
      });
    });
  }

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
    const products = GrailData.getProducts();
    const drops = products.filter(p => p.status === 'available').slice(0, 4);
    grid.innerHTML = drops.map(createCard).join('');
    observeFadeIns(grid);
    attachCardClicks(grid);
  }

  function renderCollection() {
    const grid = document.getElementById('product-grid');
    const empty = document.getElementById('grid-empty');
    const products = GrailData.getProducts();
    let filtered = products;
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

    // Check if already in cart
    const inCart = GrailCart.getItems().find(i => i.id === product.id);

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
        <div class="modal-cta" style="display:flex;flex-direction:column;gap:12px;">
          <a href="${GrailData.getSiteContent().contact?.igUrl || 'https://www.instagram.com/grail_plug.co/'}" target="_blank" class="btn btn-outline btn-lg" style="width:100%;justify-content:center;color:var(--accent);border-color:var(--border);">
            DM TO COP
          </a>
          <div style="display:flex;gap:12px;">
            <button class="btn btn-outline btn-lg modal-add-cart" data-id="${product.id}" style="flex:1;justify-content:center;color:var(--accent);border-color:var(--border);" ${inCart ? 'disabled style="opacity:0.5"' : ''}>
              ${inCart ? 'IN CART' : 'ADD TO CART'}
            </button>
            <button class="btn btn-primary btn-lg modal-buy-now" data-id="${product.id}" style="flex:1;justify-content:center;">
              BUY NOW
            </button>
          </div>
        </div>
      ` : '<div class="modal-cta"><button class="btn btn-primary btn-lg" style="background:var(--text-secondary);cursor:not-allowed;width:100%;justify-content:center" disabled>SOLD OUT</button></div>'}
      <p class="modal-note" style="margin-top:12px">Serious buyers only. Feel free to authenticate the piece before purchasing. DM for any questions or additional photos.</p>
    `;

    // Wire add-to-cart
    const addBtn = modalInfo.querySelector('.modal-add-cart');
    if (addBtn && !inCart) {
      addBtn.addEventListener('click', () => {
        const added = GrailCart.addItem(product);
        if (added) {
          addBtn.innerHTML = `ADDED`;
          addBtn.disabled = true;
          addBtn.style.opacity = '0.5';
          // Brief animation
          addBtn.style.background = '#2E7D32';
          addBtn.style.color = '#FFF';
          setTimeout(() => { addBtn.style.background = ''; addBtn.style.color = 'var(--accent)'; }, 1500);
        }
      });
    }

    // Wire buy-now
    const buyBtn = modalInfo.querySelector('.modal-buy-now');
    if (buyBtn) {
      buyBtn.addEventListener('click', () => {
        if (!inCart) GrailCart.addItem(product);
        closeModal();
        GrailCart.openDrawer();
      });
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeAuthModal(); GrailCart.closeDrawer(); } });

  function attachCardClicks(container) {
    container.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const products = GrailData.getProducts();
        const product = products.find(p => p.id === parseInt(card.dataset.id));
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

  // ===== AUTH UI =====
  const authModal = document.getElementById('auth-modal');
  const authClose = document.getElementById('auth-close');
  const authBackdrop = document.getElementById('auth-backdrop');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');

  function openAuthModal() {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
    loginError.textContent = '';
    registerError.textContent = '';
  }
  authClose.addEventListener('click', closeAuthModal);
  authBackdrop.addEventListener('click', closeAuthModal);

  // Auth tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      if (tab.dataset.tab === 'login') {
        loginForm.style.display = 'flex';
        registerForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
      }
    });
  });

  // Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const result = GrailAuth.login(email, password);
    if (result.success) {
      closeAuthModal();
      updateUserUI();
      loginForm.reset();
    } else {
      loginError.textContent = result.error;
    }
  });

  // Register
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const result = GrailAuth.register(name, email, password);
    if (result.success) {
      closeAuthModal();
      updateUserUI();
      registerForm.reset();
    } else {
      registerError.textContent = result.error;
    }
  });

  // User icon & dropdown
  const userIconBtn = document.getElementById('user-icon-btn');
  const userIconSvg = document.getElementById('user-icon-svg');
  const userAvatar = document.getElementById('user-avatar');
  const userDropdown = document.getElementById('user-dropdown');

  userIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!GrailAuth.isLoggedIn()) {
      openAuthModal();
    } else {
      userDropdown.classList.toggle('active');
    }
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    userDropdown.classList.remove('active');
  });

  function updateUserUI() {
    const user = GrailAuth.getCurrentUser();
    if (user) {
      userIconSvg.style.display = 'none';
      userAvatar.style.display = 'flex';
      userAvatar.textContent = GrailAuth.getUserInitial();
      // Build dropdown
      let adminLink = '';
      if (user.role === 'admin') {
        adminLink = '<a href="admin.html" class="dropdown-item dropdown-admin">★ ADMIN PANEL</a>';
      }
      userDropdown.innerHTML = `
        <div class="dropdown-header">
          <span class="dropdown-name">${user.name}</span>
          <span class="dropdown-email">${user.email}</span>
        </div>
        <div class="dropdown-divider"></div>
        ${adminLink}
        <button class="dropdown-item dropdown-logout" id="logout-btn">SIGN OUT</button>
      `;
      document.getElementById('logout-btn').addEventListener('click', () => {
        GrailAuth.logout();
        updateUserUI();
        userDropdown.classList.remove('active');
      });
    } else {
      userIconSvg.style.display = 'block';
      userAvatar.style.display = 'none';
      userDropdown.innerHTML = '';
    }
  }

  // --- Init ---
  applySiteContent();
  buildCategoryTabs();
  renderDrops();
  renderCollection();
  updateUserUI();
  GrailCart.init();
});
