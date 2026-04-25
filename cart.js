// ===== CART.JS — Grail Plug Supply Cart =====

const GrailCart = {
  CART_KEY: 'grail_cart',

  getItems() {
    return JSON.parse(localStorage.getItem(this.CART_KEY) || '[]');
  },
  _save(items) {
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    this._updateBadge();
    this._renderDrawer();
  },

  addItem(product) {
    const items = this.getItems();
    // 1-of-1: no duplicates
    if (items.find(i => i.id === product.id)) return false;
    items.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      size: product.sizeLabel,
      image: product.image
    });
    this._save(items);
    return true;
  },

  removeItem(id) {
    this._save(this.getItems().filter(i => i.id !== id));
  },

  clear() {
    this._save([]);
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + i.price, 0);
  },

  getCount() {
    return this.getItems().length;
  },

  // --- UI Badge ---
  _updateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = this.getCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  },

  // --- Cart Drawer ---
  openDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) { drawer.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  closeDrawer() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) { drawer.classList.remove('active'); document.body.style.overflow = ''; }
  },

  _renderDrawer() {
    const list = document.getElementById('cart-items');
    const emptyEl = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    const totalEl = document.getElementById('cart-total');
    if (!list) return;

    const items = this.getItems();
    if (items.length === 0) {
      list.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'flex';
      if (footerEl) footerEl.style.display = 'none';
    } else {
      if (emptyEl) emptyEl.style.display = 'none';
      if (footerEl) footerEl.style.display = 'block';
      list.innerHTML = items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <span class="cart-item-brand">${item.brand}</span>
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-size">${item.size}</span>
            <span class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</span>
          </div>
          <button class="cart-item-remove" onclick="GrailCart.removeItem(${item.id})" aria-label="Remove item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('');
      if (totalEl) totalEl.textContent = `₹${this.getTotal().toLocaleString('en-IN')}`;
    }
  },

  // Checkout — create order & redirect to IG
  checkout() {
    const user = GrailAuth.getCurrentUser();
    if (!user) {
      // Open login modal
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.add('active');
      this.closeDrawer();
      return;
    }
    const items = this.getItems();
    if (items.length === 0) return;

    // Create order
    const order = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      items: items,
      total: this.getTotal(),
    };
    GrailData.addOrder(order);

    // Mark items as sold
    items.forEach(item => {
      GrailData.updateProduct(item.id, { status: 'sold' });
    });

    this.clear();
    this.closeDrawer();

    // Redirect to Instagram DM
    const content = GrailData.getSiteContent();
    const igUrl = content.contact?.igUrl || 'https://www.instagram.com/grail_plug.co/';
    window.open(igUrl, '_blank');

    // Refresh page to show updated stock
    setTimeout(() => location.reload(), 500);
  },

  // Init
  init() {
    this._updateBadge();
    this._renderDrawer();
  }
};
