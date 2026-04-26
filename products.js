// ===== GRAIL DATA LAYER — Supabase Backend =====

const GrailData = {
  // --- Products ---
  async getProducts() {
    const { data, error } = await _supabaseClient.from('products').select('*').order('id');
    if (error) { console.error('getProducts:', error); return []; }
    // Map DB columns to frontend format
    return data.map(p => ({
      id: p.id, name: p.name, brand: p.brand, category: p.category,
      size: p.size, sizeLabel: p.size_label, price: p.price, status: p.status,
      image: p.image, measurements: p.measurements || {}, desc: p.description
    }));
  },

  async getProductById(id) {
    const { data, error } = await _supabaseClient.from('products').select('*').eq('id', id).single();
    if (error || !data) return null;
    return {
      id: data.id, name: data.name, brand: data.brand, category: data.category,
      size: data.size, sizeLabel: data.size_label, price: data.price, status: data.status,
      image: data.image, measurements: data.measurements || {}, desc: data.description
    };
  },

  async addProduct(product) {
    const row = {
      name: product.name, brand: product.brand, category: product.category,
      size: product.size, size_label: product.sizeLabel, price: product.price,
      status: product.status || 'available', image: product.image,
      measurements: product.measurements || {}, description: product.desc
    };
    const { data, error } = await _supabaseClient.from('products').insert(row).select().single();
    if (error) { console.error('addProduct:', error); return null; }
    return data;
  },

  async updateProduct(id, updates) {
    const row = {};
    if (updates.name !== undefined) row.name = updates.name;
    if (updates.brand !== undefined) row.brand = updates.brand;
    if (updates.category !== undefined) row.category = updates.category;
    if (updates.size !== undefined) row.size = updates.size;
    if (updates.sizeLabel !== undefined) row.size_label = updates.sizeLabel;
    if (updates.price !== undefined) row.price = updates.price;
    if (updates.status !== undefined) row.status = updates.status;
    if (updates.image !== undefined) row.image = updates.image;
    if (updates.measurements !== undefined) row.measurements = updates.measurements;
    if (updates.desc !== undefined) row.description = updates.desc;
    const { data, error } = await _supabaseClient.from('products').update(row).eq('id', id).select().single();
    if (error) console.error('updateProduct:', error);
    return data;
  },

  async deleteProduct(id) {
    const { error } = await _supabaseClient.from('products').delete().eq('id', id);
    if (error) console.error('deleteProduct:', error);
  },

  // --- Categories ---
  async getCategories() {
    const { data, error } = await _supabaseClient.from('categories').select('*').order('name');
    if (error) { console.error('getCategories:', error); return []; }
    return data;
  },

  async addCategory(cat) {
    cat.id = cat.name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await _supabaseClient.from('categories').insert(cat).select().single();
    if (error) console.error('addCategory:', error);
    return data;
  },

  async updateCategory(id, updates) {
    const { error } = await _supabaseClient.from('categories').update(updates).eq('id', id);
    if (error) console.error('updateCategory:', error);
  },

  async deleteCategory(id) {
    const { error } = await _supabaseClient.from('categories').delete().eq('id', id);
    if (error) console.error('deleteCategory:', error);
  },

  // --- Site Content ---
  async getSiteContent() {
    const { data, error } = await _supabaseClient.from('site_content').select('*');
    if (error) { console.error('getSiteContent:', error); return {}; }
    const content = {};
    data.forEach(row => { content[row.section] = row.data; });
    return content;
  },

  async updateSiteSection(section, sectionData) {
    // Merge with existing
    const { data: existing } = await _supabaseClient.from('site_content').select('data').eq('section', section).single();
    const merged = existing ? { ...existing.data, ...sectionData } : sectionData;
    const { error } = await _supabaseClient.from('site_content').upsert({ section, data: merged });
    if (error) console.error('updateSiteSection:', error);
  },

  // --- Orders ---
  async getOrders() {
    const { data, error } = await _supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
    if (error) { console.error('getOrders:', error); return []; }
    return data.map(o => ({
      id: o.id, userId: o.user_id, userName: o.user_name, userEmail: o.user_email,
      items: o.items, total: o.total, status: o.status, date: o.created_at
    }));
  },

  async addOrder(order) {
    const row = {
      user_id: order.userId, user_name: order.userName, user_email: order.userEmail,
      items: order.items, total: order.total, status: 'pending'
    };
    const { data, error } = await _supabaseClient.from('orders').insert(row).select().single();
    if (error) console.error('addOrder:', error);
    return data;
  },

  async updateOrderStatus(id, status) {
    const { error } = await _supabaseClient.from('orders').update({ status }).eq('id', id);
    if (error) console.error('updateOrderStatus:', error);
  }
};
