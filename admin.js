// ===== ADMIN.JS — Supabase Backend =====

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const isAdmin = await GrailAuth.isAdmin();
  if (!isAdmin) {
    document.getElementById('auth-block').style.display = 'flex';
    document.getElementById('admin-app').style.display = 'none';
    return;
  }

  document.getElementById('auth-block').style.display = 'none';
  document.getElementById('admin-app').style.display = 'flex';

  const user = await GrailAuth.getCurrentUser();
  document.getElementById('topbar-name').textContent = user.name;
  document.getElementById('topbar-avatar').textContent = user.name.charAt(0).toUpperCase();

  // --- Navigation ---
  const views = ['dashboard', 'products', 'categories', 'orders', 'content'];
  let currentView = 'dashboard';

  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.addEventListener('click', async () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      nav.classList.add('active');
      currentView = nav.dataset.view;
      views.forEach(v => { document.getElementById(`view-${v}`).classList.remove('active'); });
      document.getElementById(`view-${currentView}`).classList.add('active');
      const titles = { dashboard: 'Dashboard', products: 'Manage Products', categories: 'Categories', orders: 'Recent Orders', content: 'Site Content' };
      document.getElementById('page-title').textContent = titles[currentView];

      if (currentView === 'dashboard') await renderDashboard();
      if (currentView === 'products') await renderProducts();
      if (currentView === 'categories') await renderCategories();
      if (currentView === 'orders') await renderOrders();
      if (currentView === 'content') renderContentEditor();
    });
  });

  document.getElementById('admin-logout').addEventListener('click', async () => {
    await GrailAuth.logout();
    window.location.href = 'index.html';
  });

  // --- Dashboard ---
  async function renderDashboard() {
    const products = await GrailData.getProducts();
    const orders = await GrailData.getOrders();

    const available = products.filter(p => p.status === 'available').length;
    const sold = products.filter(p => p.status === 'sold').length;
    const soldRevenue = products.filter(p => p.status === 'sold').reduce((sum, p) => sum + p.price, 0);

    document.getElementById('dash-available').textContent = available;
    document.getElementById('dash-sold').textContent = sold;
    document.getElementById('dash-revenue').textContent = `₹${soldRevenue.toLocaleString('en-IN')}`;
    document.getElementById('dash-orders-count').textContent = orders.length;

    renderCategoryChart(products);
    renderRevenueChart();
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
    const cx = canvas.width / 2, cy = canvas.height / 2, radius = Math.min(cx, cy) - 20;
    let i = 0;
    for (const [cat, count] of Object.entries(counts)) {
      const sliceAngle = (count / total) * 2 * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath(); ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      startAngle += sliceAngle; i++;
    }
  }

  function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const data = [1200, 4500, 0, 8900, 3200, 1500, 6000];
    const max = Math.max(...data) || 10000;
    const padding = 40, w = canvas.width - padding * 2, h = canvas.height - padding * 2;
    const barW = w / data.length - 10;
    ctx.fillStyle = '#0C1014';
    data.forEach((val, i) => {
      const barH = (val / max) * h;
      ctx.fillRect(padding + i * (w / data.length) + 5, canvas.height - padding - barH, barW, barH);
    });
    ctx.beginPath(); ctx.moveTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#E0E4E8'; ctx.stroke();
  }

  // --- Products ---
  let editingProductId = null;
  const prodModal = document.getElementById('admin-product-modal');

  async function renderProducts() {
    const tbody = document.getElementById('products-tbody');
    const search = document.getElementById('prod-search').value.toLowerCase();
    const filter = document.getElementById('prod-filter').value;
    let products = await GrailData.getProducts();
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
      btn.addEventListener('click', async () => {
        if (confirm('Delete this product?')) {
          await GrailData.deleteProduct(parseInt(btn.dataset.id));
          await renderProducts();
        }
      });
    });
  }

  document.getElementById('prod-search').addEventListener('input', () => renderProducts());
  document.getElementById('prod-filter').addEventListener('change', () => renderProducts());
  document.getElementById('btn-add-product').addEventListener('click', () => openProductModal(null));

  async function openProductModal(id) {
    editingProductId = id;
    const form = document.getElementById('ap-form');
    form.reset();
    const catSelect = document.getElementById('ap-category');
    const cats = await GrailData.getCategories();
    catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    if (id) {
      document.getElementById('ap-modal-title').textContent = 'Edit Product';
      const p = await GrailData.getProductById(id);
      if (p) {
        document.getElementById('ap-name').value = p.name;
        document.getElementById('ap-brand').value = p.brand;
        document.getElementById('ap-category').value = p.category;
        document.getElementById('ap-price').value = p.price;
        document.getElementById('ap-status').value = p.status;
        document.getElementById('ap-size').value = p.size;
        document.getElementById('ap-sizeLabel').value = p.sizeLabel;
        document.getElementById('ap-image').value = p.image;
        document.getElementById('ap-desc').value = p.desc || '';
      }
    } else {
      document.getElementById('ap-modal-title').textContent = 'Add Product';
    }
    prodModal.classList.add('active');
  }

  document.getElementById('ap-form').addEventListener('submit', async (e) => {
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
    if (editingProductId) { await GrailData.updateProduct(editingProductId, p); }
    else { await GrailData.addProduct(p); }
    prodModal.classList.remove('active');
    await renderProducts();
  });

  // --- Categories ---
  async function renderCategories() {
    const tbody = document.getElementById('categories-tbody');
    const cats = await GrailData.getCategories();
    const prods = await GrailData.getProducts();
    tbody.innerHTML = cats.map(c => {
      const count = prods.filter(p => p.category === c.id).length;
      return `
      <tr>
        <td style="font-size:20px">${c.icon}</td>
        <td><strong>${c.name}</strong></td>
        <td><code>${c.id}</code></td>
        <td>${count} pieces</td>
        <td><button class="btn btn-outline btn-sm btn-del-cat" data-id="${c.id}" style="color:var(--sold);border-color:var(--sold)">Delete</button></td>
      </tr>`;
    }).join('');
    tbody.querySelectorAll('.btn-del-cat').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this category?')) { await GrailData.deleteCategory(btn.dataset.id); await renderCategories(); }
      });
    });
  }

  // --- Orders ---
  async function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    const orders = await GrailData.getOrders();
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
        <td><button class="btn btn-outline btn-sm">View</button></td>
      </tr>
    `).join('');
  }

  // --- Site Content Editor ---
  function renderContentEditor() {
    const tabs = document.querySelectorAll('.content-tab');
    const editor = document.getElementById('content-editor');
    let activeSection = document.querySelector('.content-tab.active').dataset.section;

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        activeSection = e.target.dataset.section;
        buildEditorForm();
      });
    });

    async function buildEditorForm() {
      const content = await GrailData.getSiteContent();
      if (activeSection === 'hero') {
        const h = content.hero || {};
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">Hero Section</h3>
          <div class="form-grid">
            <div class="form-group"><label>Badge Text</label><input type="text" class="form-control ce-input" data-key="badge" value="${h.badge || ''}"></div>
            <div class="form-group"><label>Line 1</label><input type="text" class="form-control ce-input" data-key="line1" value="${h.line1 || ''}"></div>
            <div class="form-group"><label>Line 2 (Accent)</label><input type="text" class="form-control ce-input" data-key="line2" value="${h.line2 || ''}"></div>
            <div class="form-group"><label>Line 3</label><input type="text" class="form-control ce-input" data-key="line3" value="${h.line3 || ''}"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Subtitle</label><input type="text" class="form-control ce-input" data-key="subtitle" value="${h.subtitle || ''}"></div>
          </div>
          <button class="btn btn-primary" id="ce-save" style="margin-top:24px">SAVE HERO CONTENT</button>
        `;
      } else if (activeSection === 'contact') {
        const c = content.contact || {};
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">Contact / DM Section</h3>
          <div class="form-grid">
            <div class="form-group"><label>Tag</label><input type="text" class="form-control ce-input" data-key="tag" value="${c.tag || ''}"></div>
            <div class="form-group"><label>Title</label><input type="text" class="form-control ce-input" data-key="title" value="${c.title || ''}"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Description</label><input type="text" class="form-control ce-input" data-key="desc" value="${c.desc || ''}"></div>
            <div class="form-group"><label>IG Handle</label><input type="text" class="form-control ce-input" data-key="igHandle" value="${c.igHandle || ''}"></div>
            <div class="form-group"><label>IG URL</label><input type="text" class="form-control ce-input" data-key="igUrl" value="${c.igUrl || ''}"></div>
          </div>
          <button class="btn btn-primary" id="ce-save" style="margin-top:24px">SAVE CONTACT CONTENT</button>
        `;
      } else if (activeSection === 'about') {
        const a = content.about || {};
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">About Section</h3>
          <div class="form-grid">
            <div class="form-group"><label>Tag</label><input type="text" class="form-control ce-input" data-key="tag" value="${a.tag || ''}"></div>
            <div class="form-group"><label>Title (HTML allowed)</label><input type="text" class="form-control ce-input" data-key="title" value="${(a.title || '').replace(/"/g, '&quot;')}"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Paragraph 1</label><textarea class="form-control ce-input" data-key="text1" rows="3">${a.text1 || ''}</textarea></div>
            <div class="form-group" style="grid-column:1/-1"><label>Paragraph 2</label><textarea class="form-control ce-input" data-key="text2" rows="3">${a.text2 || ''}</textarea></div>
          </div>
          <button class="btn btn-primary" id="ce-save" style="margin-top:24px">SAVE ABOUT CONTENT</button>
        `;
      } else if (activeSection === 'announcements') {
        const ann = content.announcements || [];
        editor.innerHTML = `
          <h3 style="margin-bottom:20px;font-family:var(--font-display)">Announcement Bar Messages</h3>
          <p style="color:var(--text-secondary);margin-bottom:16px;font-size:13px">One message per line. These scroll across the top of the site.</p>
          <div class="form-group">
            <textarea class="form-control" id="ce-announcements" rows="8" style="font-family:var(--font-mono);font-size:13px">${ann.join('\n')}</textarea>
          </div>
          <button class="btn btn-primary" id="ce-save-ann" style="margin-top:24px">SAVE ANNOUNCEMENTS</button>
        `;
        const saveAnn = document.getElementById('ce-save-ann');
        if (saveAnn) {
          saveAnn.addEventListener('click', async () => {
            const lines = document.getElementById('ce-announcements').value.split('\n').filter(l => l.trim());
            await GrailData.updateSiteSection('announcements', lines);
            // For announcements, we store as array directly
            const { error } = await _supabaseClient.from('site_content').upsert({ section: 'announcements', data: lines });
            if (!error) { saveAnn.textContent = 'SAVED ✓'; saveAnn.style.background = 'var(--success)'; setTimeout(() => { saveAnn.textContent = 'SAVE ANNOUNCEMENTS'; saveAnn.style.background = ''; }, 2000); }
          });
        }
        return;
      } else {
        editor.innerHTML = `<p style="color:var(--text-secondary)">Select a section to edit.</p>`;
        return;
      }

      const saveBtn = document.getElementById('ce-save');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          const updates = {};
          document.querySelectorAll('.ce-input').forEach(input => {
            updates[input.dataset.key] = input.value;
          });
          await GrailData.updateSiteSection(activeSection, updates);
          saveBtn.textContent = 'SAVED ✓';
          saveBtn.style.background = 'var(--success)';
          setTimeout(() => { saveBtn.textContent = 'SAVE CONTENT'; saveBtn.style.background = ''; }, 2000);
        });
      }
    }

    buildEditorForm();
  }

  // --- Initial Render ---
  await renderDashboard();
});
