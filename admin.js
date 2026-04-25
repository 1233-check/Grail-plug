// ===== ADMIN.JS — Grail Plug Supply =====

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!GrailAuth.isAdmin()) {
    document.getElementById('auth-block').style.display = 'flex';
    document.getElementById('admin-app').style.display = 'none';
    return;
  }

  document.getElementById('auth-block').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';

  const user = GrailAuth.getCurrentUser();
  document.getElementById('topbar-name').textContent = user.name;
  document.getElementById('topbar-avatar').textContent = user.name.charAt(0).toUpperCase();

  // --- Navigation ---
  const views = ['dashboard', 'products', 'categories', 'orders', 'content'];
  let currentView = 'dashboard';

  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      nav.classList.add('active');
      currentView = nav.dataset.view;
      
      views.forEach(v => {
        document.getElementById(`view-${v}`).classList.remove('active');
      });
      document.getElementById(`view-${currentView}`).classList.add('active');
      
      const titles = {
        dashboard: 'Dashboard', products: 'Manage Products',
        categories: 'Categories', orders: 'Recent Orders', content: 'Site Content'
      };
      document.getElementById('page-title').textContent = titles[currentView];

      if (currentView === 'dashboard') renderDashboard();
      if (currentView === 'products') renderProducts();
      if (currentView === 'categories') renderCategories();
      if (currentView === 'orders') renderOrders();
      if (currentView === 'content') renderContentEditor();
    });
  });

  document.getElementById('admin-logout').addEventListener('click', () => {
    GrailAuth.logout();
    window.location.href = 'index.html';
  });

  // --- Dashboard ---
  function renderDashboard() {
    const products = GrailData.getProducts();
    const orders = GrailData.getOrders();

    const available = products.filter(p => p.status === 'available').length;
    const sold = products.filter(p => p.status === 'sold').length;
    
    // For demo, calculate revenue from all sold items even if no explicit order exists
    const soldRevenue = products.filter(p => p.status === 'sold').reduce((sum, p) => sum + p.price, 0);

    document.getElementById('dash-available').textContent = available;
    document.getElementById('dash-sold').textContent = sold;
    document.getElementById('dash-revenue').textContent = `₹${soldRevenue.toLocaleString('en-IN')}`;
    document.getElementById('dash-orders-count').textContent = orders.length;

    renderCategoryChart(products);
    renderRevenueChart(); // Mock data for demo
  }

  function renderCategoryChart(products) {
    const canvas = document.getElementById('categoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const counts = {};
    products.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    
    let total = Object.values(counts).reduce((a,b)=>a+b, 0);
    if (total === 0) return;

    const colors = ['#0C1014', '#ED4956', '#6A717A', '#E0E4E8', '#2E7D32'];
    let startAngle = 0;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 20;

    let i = 0;
    for (const [cat, count] of Object.entries(counts)) {
      const sliceAngle = (count / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += sliceAngle;
      i++;
    }
  }

  function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mock data: last 7 days
    const data = [1200, 4500, 0, 8900, 3200, 1500, 6000];
    const max = Math.max(...data) || 10000;
    const padding = 40;
    const w = canvas.width - padding * 2;
    const h = canvas.height - padding * 2;
    const barW = w / data.length - 10;

    ctx.fillStyle = '#0C1014';
    data.forEach((val, i) => {
      const barH = (val / max) * h;
      const x = padding + i * (w / data.length) + 5;
      const y = canvas.height - padding - barH;
      ctx.fillRect(x, y, barW, barH);
    });

    // Baseline
    ctx.beginPath();
    ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#E0E4E8';
    ctx.stroke();
  }

  // --- Products ---
  let editingProductId = null;
  const prodModal = document.getElementById('admin-product-modal');
  
  function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    const search = document.getElementById('prod-search').value.toLowerCase();
    const filter = document.getElementById('prod-filter').value;
    
    let products = GrailData.getProducts();
    if (filter !== 'all') products = products.filter(p => p.status === filter);
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search));

    tbody.innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.image}" alt="${p.name}"></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.brand}</td>
        <td>${p.category}</td>
        <td>₹${p.price.toLocaleString('en-IN')}</td>
        <td><span class="status-badge status-${p.status}">${p.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm btn-edit" data-id="${p.id}">Edit</button>
          <button class="btn btn-outline btn-sm btn-del" data-id="${p.id}" style="color:var(--sold);border-color:var(--sold)">Del</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openProductModal(parseInt(btn.dataset.id)));
    });
    tbody.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this product?')) {
          GrailData.deleteProduct(parseInt(btn.dataset.id));
          renderProducts();
        }
      });
    });
  }

  document.getElementById('prod-search').addEventListener('input', renderProducts);
  document.getElementById('prod-filter').addEventListener('change', renderProducts);

  document.getElementById('btn-add-product').addEventListener('click', () => openProductModal(null));

  function openProductModal(id) {
    editingProductId = id;
    const form = document.getElementById('ap-form');
    form.reset();

    // Populate category dropdown
    const catSelect = document.getElementById('ap-category');
    catSelect.innerHTML = GrailData.getCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (id) {
      document.getElementById('ap-modal-title').textContent = 'Edit Product';
      const p = GrailData.getProductById(id);
      document.getElementById('ap-name').value = p.name;
      document.getElementById('ap-brand').value = p.brand;
      document.getElementById('ap-category').value = p.category;
      document.getElementById('ap-price').value = p.price;
      document.getElementById('ap-status').value = p.status;
      document.getElementById('ap-size').value = p.size;
      document.getElementById('ap-sizeLabel').value = p.sizeLabel;
      document.getElementById('ap-image').value = p.image;
      document.getElementById('ap-desc').value = p.desc;
    } else {
      document.getElementById('ap-modal-title').textContent = 'Add Product';
    }
    prodModal.classList.add('active');
  }

  document.getElementById('ap-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const p = {
      name: document.getElementById('ap-name').value,
      brand: document.getElementById('ap-brand').value,
      category: document.getElementById('ap-category').value,
      price: parseInt(document.getElementById('ap-price').value),
      status: document.getElementById('ap-status').value,
      size: document.getElementById('ap-size').value,
      sizeLabel: document.getElementById('ap-sizeLabel').value,
      image: document.getElementById('ap-image').value,
      desc: document.getElementById('ap-desc').value,
      measurements: { Details: "Added via Admin" }
    };

    if (editingProductId) {
      GrailData.updateProduct(editingProductId, p);
    } else {
      GrailData.addProduct(p);
    }
    prodModal.classList.remove('active');
    renderProducts();
    if (currentView === 'dashboard') renderDashboard();
  });

  // --- Categories ---
  function renderCategories() {
    const tbody = document.getElementById('categories-tbody');
    const cats = GrailData.getCategories();
    const prods = GrailData.getProducts();

    tbody.innerHTML = cats.map(c => {
      const count = prods.filter(p => p.category === c.id).length;
      return `
      <tr>
        <td style="font-size:20px">${c.icon}</td>
        <td><strong>${c.name}</strong></td>
        <td><code>${c.id}</code></td>
        <td>${count} pieces</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="alert('Demo: Edit category not fully wired')">Edit</button>
        </td>
      </tr>
    `}).join('');
  }

  // --- Orders ---
  function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    const orders = GrailData.getOrders();

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-secondary)">No orders yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td><strong>#${o.id.toString().padStart(4, '0')}</strong></td>
        <td>${new Date(o.date).toLocaleDateString()}</td>
        <td>${o.userName}<br><span style="font-size:11px;color:var(--text-secondary)">${o.userEmail}</span></td>
        <td>${o.items.length} items</td>
        <td>₹${o.total.toLocaleString('en-IN')}</td>
        <td><span class="status-badge status-${o.status}">${o.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm">View</button>
        </td>
      </tr>
    `).join('');
  }

  // --- Site Content Editor ---
  function renderContentEditor() {
    const tabs = document.querySelectorAll('.content-tab');
    const editor = document.getElementById('content-editor');
    const content = GrailData.getSiteContent();

    let activeSection = document.querySelector('.content-tab.active').dataset.section;

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        activeSection = e.target.dataset.section;
        buildEditorForm();
      });
    });

    function buildEditorForm() {
      if (activeSection === 'hero') {
        const h = content.hero;
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">Hero Section</h3>
          <div class="form-grid">
            <div class="form-group"><label>Badge Text</label><input type="text" class="form-control ce-input" data-key="badge" value="${h.badge}"></div>
            <div class="form-group"><label>Line 1</label><input type="text" class="form-control ce-input" data-key="line1" value="${h.line1}"></div>
            <div class="form-group"><label>Line 2 (Accent)</label><input type="text" class="form-control ce-input" data-key="line2" value="${h.line2}"></div>
            <div class="form-group"><label>Line 3</label><input type="text" class="form-control ce-input" data-key="line3" value="${h.line3}"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Subtitle</label><input type="text" class="form-control ce-input" data-key="subtitle" value="${h.subtitle}"></div>
          </div>
          <button class="btn btn-primary" id="ce-save" style="margin-top:24px">SAVE HERO CONTENT</button>
        `;
      } else if (activeSection === 'contact') {
        const c = content.contact;
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">Contact / DM Section</h3>
          <div class="form-grid">
            <div class="form-group"><label>Tag</label><input type="text" class="form-control ce-input" data-key="tag" value="${c.tag}"></div>
            <div class="form-group"><label>Title</label><input type="text" class="form-control ce-input" data-key="title" value="${c.title}"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Description</label><input type="text" class="form-control ce-input" data-key="desc" value="${c.desc}"></div>
            <div class="form-group"><label>IG Handle</label><input type="text" class="form-control ce-input" data-key="igHandle" value="${c.igHandle}"></div>
            <div class="form-group"><label>IG URL</label><input type="text" class="form-control ce-input" data-key="igUrl" value="${c.igUrl}"></div>
          </div>
          <button class="btn btn-primary" id="ce-save" style="margin-top:24px">SAVE CONTACT CONTENT</button>
        `;
      } else {
        editor.innerHTML = `<p style="color:var(--text-secondary)">Editor for this section is not implemented in the demo.</p>`;
      }

      const saveBtn = document.getElementById('ce-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const updates = {};
          document.querySelectorAll('.ce-input').forEach(input => {
            updates[input.dataset.key] = input.value;
          });
          GrailData.updateSiteSection(activeSection, updates);
          saveBtn.textContent = 'SAVED ✓';
          saveBtn.style.background = 'var(--success)';
          setTimeout(() => { saveBtn.textContent = 'SAVE CONTENT'; saveBtn.style.background = ''; }, 2000);
        });
      }
    }
    
    buildEditorForm();
  }

  // --- Initial Render ---
  renderDashboard();

});
