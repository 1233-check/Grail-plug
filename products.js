// ===== GRAIL DATA LAYER =====
// All data stored in localStorage. Seeds defaults on first load.

const DEFAULT_PRODUCTS = [
  {
    id:1, name:"FreeSoul Waxed Jacket", brand:"FREESOUL", category:"jackets",
    size:"M", sizeLabel:"Chest 36/38", price:4199, status:"sold",
    image:"images/hero-jacket.png",
    measurements:{Chest:"36/38",Length:"26 (from shoulder)",Sleeves:"27"},
    desc:"Rare waxed jacket from FreeSoul. Heavy texture, matte finish. 1 of 1."
  },
  {
    id:2, name:"Hugo Boss Germany Waxed Flared", brand:"HUGO BOSS", category:"denim",
    size:"30", sizeLabel:"Waist 30", price:4199, status:"available",
    image:"images/product-cargo.png",
    measurements:{Waist:"30",Rise:"9.5",Thigh:"21",Inseam:"28",Length:"39.5","Leg Opening":"8.5"},
    desc:"Hugo Boss Germany waxed flared denim. Raw selvedge edge detail. 1 of 1."
  },
  {
    id:3, name:"Armani Jeans Distressed", brand:"ARMANI", category:"denim",
    size:"32", sizeLabel:"Waist 32", price:1800, status:"available",
    image:"images/product-sneakers.png",
    measurements:{Waist:"32",Rise:"10",Thigh:"22",Inseam:"30",Length:"40"},
    desc:"Authentic Armani distressed jeans with heavy wash. Union Jack patch detail."
  },
  {
    id:4, name:"Archive Denim Collection", brand:"VARIOUS", category:"denim",
    size:"30", sizeLabel:"Waist 28-34", price:1200, status:"available",
    image:"images/product-tshirt.png",
    measurements:{Waist:"28-34 (multiple pieces)",Length:"varies"},
    desc:"Curated selection of vintage archive denim. Multiple washes & fits."
  },
  {
    id:5, name:"Vintage Leather Biker Jacket", brand:"ARCHIVE", category:"jackets",
    size:"L", sizeLabel:"Chest 40/42", price:3999, status:"available",
    image:"images/product-leather-jacket.png",
    measurements:{Chest:"40/42",Length:"27",Sleeves:"25"},
    desc:"Classic vintage leather biker jacket. Heavy patina, broken-in feel."
  },
  {
    id:6, name:"Cream Archive Hoodie", brand:"ARCHIVE", category:"tops",
    size:"XL", sizeLabel:"Chest 44", price:2200, status:"available",
    image:"images/product-hoodie.png",
    measurements:{Chest:"44",Length:"28",Sleeves:"26"},
    desc:"Heavyweight cream hoodie with vintage wash. Oversized fit."
  },
  {
    id:7, name:"Designer Crossbody Bag", brand:"ARCHIVE", category:"accessories",
    size:"OS", sizeLabel:"One Size", price:1500, status:"sold",
    image:"images/product-bag.png",
    measurements:{Height:"8",Width:"12",Depth:"3.5","Strap Drop":"22"},
    desc:"Vintage designer crossbody in dark brown leather. Beautiful patina."
  },
  {
    id:8, name:"Vintage Belt Silver Hardware", brand:"ARCHIVE", category:"accessories",
    size:"32", sizeLabel:"Waist 32", price:899, status:"available",
    image:"images/product-belt.png",
    measurements:{Length:"38",Width:"1.5"},
    desc:"Black leather belt with aged silver hardware. Classic archive piece."
  },
  {
    id:9, name:"Olive Cargo Wide-Leg", brand:"ARCHIVE", category:"pants",
    size:"34", sizeLabel:"Waist 34", price:1999, status:"available",
    image:"images/product-cargo.png",
    measurements:{Waist:"34",Rise:"11",Thigh:"24",Inseam:"30",Length:"41"},
    desc:"Military-inspired olive cargo. Wide-leg cut, heavy cotton."
  },
  {
    id:10, name:"Washed Black Graphic Tee", brand:"ARCHIVE", category:"tops",
    size:"L", sizeLabel:"Chest 42", price:1100, status:"sold",
    image:"images/product-tshirt.png",
    measurements:{Chest:"42",Length:"28",Sleeves:"9"},
    desc:"Faded vintage graphic tee in washed black. Single-stitch construction."
  },
  {
    id:11, name:"Distressed Slim Denim", brand:"FREESOUL", category:"denim",
    size:"28", sizeLabel:"Waist 28", price:1400, status:"available",
    image:"images/product-sneakers.png",
    measurements:{Waist:"28",Rise:"9",Thigh:"20",Inseam:"30",Length:"38"},
    desc:"FreeSoul slim fit distressed denim. Medium wash with whisker detail."
  },
  {
    id:12, name:"Dark Wash Bootcut Jeans", brand:"HUGO BOSS", category:"denim",
    size:"36", sizeLabel:"Waist 36", price:2400, status:"available",
    image:"images/hero-jacket.png",
    measurements:{Waist:"36",Rise:"10.5",Thigh:"24",Inseam:"32",Length:"42"},
    desc:"Hugo Boss dark wash bootcut. Heavier weight denim with subtle fading."
  }
];

const DEFAULT_CATEGORIES = [
  { id: 'denim', name: 'Denim', icon: '👖' },
  { id: 'jackets', name: 'Jackets', icon: '🧥' },
  { id: 'pants', name: 'Pants', icon: '👔' },
  { id: 'tops', name: 'Tops', icon: '👕' },
  { id: 'accessories', name: 'Accessories', icon: '👜' }
];

const DEFAULT_SITE_CONTENT = {
  announcements: [
    "★ 1 OF 1 PIECES ONLY",
    "★ SHIPS WORLDWIDE 🌍",
    "★ DM TO COP",
    "★ CURATED ARCHIVE GRAILS",
    "★ SERIOUS BUYERS ONLY"
  ],
  hero: {
    badge: "EST. 2022",
    line1: "CURATED",
    line2: "VINTAGE &",
    line3: "ARCHIVE GRAILS",
    subtitle: "Every piece is 1 of 1. When it's gone, it's gone.",
    stat1Number: "105+", stat1Label: "Pieces Curated",
    stat2Number: "2.6K+", stat2Label: "Community",
    stat3Number: "🌍", stat3Label: "Ships Worldwide"
  },
  about: {
    tag: "THE STORY",
    title: "ONLY FOR HIGHLY<br>EDUCATED FASHION<br>PEOPLE",
    text1: "Grail Plug Supply is a curated archive fashion destination. We source dead-stock, vintage, and rare 1-of-1 pieces from brands like Hugo Boss Germany, FreeSoul, Armani, and more.",
    text2: "Every single piece in our collection is unique — one size, one piece, one chance. When it sells, it's gone forever. No restocks. No replicas. Just pure, authenticated archive fashion.",
    values: [
      { title: "Authenticated", desc: "Every piece verified before listing" },
      { title: "1 of 1", desc: "No two pieces are the same" },
      { title: "Worldwide Shipping", desc: "We ship to every corner of the globe" }
    ]
  },
  reviews: [
    "\"Absolutely perfect piece, loved it\" ★★★★★",
    "\"Got the drippp! 🔥\" ★★★★★",
    "\"Legit seller, fast shipping\" ★★★★★",
    "\"Quality is insane for the price\" ★★★★★",
    "\"Best archive plug in India\" ★★★★★"
  ],
  contact: {
    tag: "DM TO COP",
    title: "WANT A PIECE?",
    desc: "All purchases happen via Instagram DM. Tap below to start a conversation.",
    igHandle: "@grail_plug.co",
    igUrl: "https://www.instagram.com/grail_plug.co/"
  },
  footer: {
    tagline: "Curated Vintage & Archive Grails<br>Dead Grails Mostly.",
    copyright: "© 2026 Grail Plug Supply. All rights reserved.",
    bottomText: "Only for Highly Educated Fashion People."
  },
  drops: {
    tag: "NEW DROP",
    title: "LATEST DROP",
    desc: "Fresh pieces just landed. Pre-booking available."
  },
  collection: {
    tag: "1 OF 1",
    title: "SHOP BY YOUR SIZE",
    desc: "Every piece is unique. Find what fits you."
  }
};

// ===== GrailData API =====
const GrailData = {
  init() {
    if (!localStorage.getItem('grail_products')) {
      localStorage.setItem('grail_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('grail_categories')) {
      localStorage.setItem('grail_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem('grail_site_content')) {
      localStorage.setItem('grail_site_content', JSON.stringify(DEFAULT_SITE_CONTENT));
    }
    if (!localStorage.getItem('grail_orders')) {
      localStorage.setItem('grail_orders', JSON.stringify([]));
    }
  },

  // --- Products ---
  getProducts() {
    return JSON.parse(localStorage.getItem('grail_products') || '[]');
  },
  saveProducts(products) {
    localStorage.setItem('grail_products', JSON.stringify(products));
  },
  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },
  addProduct(product) {
    const products = this.getProducts();
    product.id = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push(product);
    this.saveProducts(products);
    return product;
  },
  updateProduct(id, updates) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) { products[idx] = { ...products[idx], ...updates }; this.saveProducts(products); }
    return products[idx];
  },
  deleteProduct(id) {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
  },

  // --- Categories ---
  getCategories() {
    return JSON.parse(localStorage.getItem('grail_categories') || '[]');
  },
  saveCategories(cats) {
    localStorage.setItem('grail_categories', JSON.stringify(cats));
  },
  addCategory(cat) {
    const cats = this.getCategories();
    cat.id = cat.name.toLowerCase().replace(/\s+/g, '-');
    cats.push(cat);
    this.saveCategories(cats);
    return cat;
  },
  updateCategory(id, updates) {
    const cats = this.getCategories();
    const idx = cats.findIndex(c => c.id === id);
    if (idx !== -1) { cats[idx] = { ...cats[idx], ...updates }; this.saveCategories(cats); }
  },
  deleteCategory(id) {
    this.saveCategories(this.getCategories().filter(c => c.id !== id));
  },

  // --- Site Content ---
  getSiteContent() {
    return JSON.parse(localStorage.getItem('grail_site_content') || '{}');
  },
  saveSiteContent(content) {
    localStorage.setItem('grail_site_content', JSON.stringify(content));
  },
  updateSiteSection(section, data) {
    const content = this.getSiteContent();
    content[section] = { ...content[section], ...data };
    this.saveSiteContent(content);
  },

  // --- Orders ---
  getOrders() {
    return JSON.parse(localStorage.getItem('grail_orders') || '[]');
  },
  saveOrders(orders) {
    localStorage.setItem('grail_orders', JSON.stringify(orders));
  },
  addOrder(order) {
    const orders = this.getOrders();
    order.id = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    order.date = new Date().toISOString();
    order.status = 'pending';
    orders.unshift(order);
    this.saveOrders(orders);
    return order;
  },
  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) { orders[idx].status = status; this.saveOrders(orders); }
  },

  // --- Reset to defaults ---
  resetAll() {
    localStorage.removeItem('grail_products');
    localStorage.removeItem('grail_categories');
    localStorage.removeItem('grail_site_content');
    localStorage.removeItem('grail_orders');
    this.init();
  }
};

// Initialize on load
GrailData.init();

// Backward compat: expose PRODUCTS for existing app.js references
const PRODUCTS = GrailData.getProducts();
