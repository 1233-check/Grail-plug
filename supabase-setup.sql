-- =============================================
-- GRAIL PLUG SUPPLY — SUPABASE SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. CREATE TABLES
-- =============================================

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  size_label TEXT NOT NULL,
  price INTEGER NOT NULL,
  status TEXT DEFAULT 'available',
  image TEXT NOT NULL,
  measurements JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📦'
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  user_email TEXT,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
  section TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
-- =============================================
-- NOTE: Replace 'checkstudio01@gmail.com' with your actual admin email address!

-- Products: public read, admin write
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "products_update" ON products FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "products_delete" ON products FOR DELETE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);

-- Categories: public read, admin write
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "categories_update" ON categories FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "categories_delete" ON categories FOR DELETE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);

-- Orders: admin reads all, authenticated users can insert their own
CREATE POLICY "orders_admin_select" ON orders FOR SELECT USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "orders_user_insert" ON orders FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);

-- Site Content: public read, admin write
CREATE POLICY "content_select" ON site_content FOR SELECT USING (true);
CREATE POLICY "content_insert" ON site_content FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);
CREATE POLICY "content_update" ON site_content FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN ('checkstudio01@gmail.com', 'tejugiri549@gmail.com')
);

-- 4. SEED DEFAULT DATA
-- =============================================

-- Categories
INSERT INTO categories (id, name, icon) VALUES
  ('denim', 'Denim', '👖'),
  ('jackets', 'Jackets', '🧥'),
  ('pants', 'Pants', '👔'),
  ('tops', 'Tops', '👕'),
  ('accessories', 'Accessories', '👜')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (name, brand, category, size, size_label, price, status, image, measurements, description) VALUES
  ('FreeSoul Waxed Jacket', 'FREESOUL', 'jackets', 'M', 'Chest 36/38', 4199, 'sold', 'images/hero-jacket.png', '{"Chest":"36/38","Length":"26 (from shoulder)","Sleeves":"27"}', 'Rare waxed jacket from FreeSoul. Heavy texture, matte finish. 1 of 1.'),
  ('Hugo Boss Germany Waxed Flared', 'HUGO BOSS', 'denim', '30', 'Waist 30', 4199, 'available', 'images/product-cargo.png', '{"Waist":"30","Rise":"9.5","Thigh":"21","Inseam":"28","Length":"39.5","Leg Opening":"8.5"}', 'Hugo Boss Germany waxed flared denim. Raw selvedge edge detail. 1 of 1.'),
  ('Armani Jeans Distressed', 'ARMANI', 'denim', '32', 'Waist 32', 1800, 'available', 'images/product-sneakers.png', '{"Waist":"32","Rise":"10","Thigh":"22","Inseam":"30","Length":"40"}', 'Authentic Armani distressed jeans with heavy wash. Union Jack patch detail.'),
  ('Archive Denim Collection', 'VARIOUS', 'denim', '30', 'Waist 28-34', 1200, 'available', 'images/product-tshirt.png', '{"Waist":"28-34 (multiple pieces)","Length":"varies"}', 'Curated selection of vintage archive denim. Multiple washes & fits.'),
  ('Vintage Leather Biker Jacket', 'ARCHIVE', 'jackets', 'L', 'Chest 40/42', 3999, 'available', 'images/product-leather-jacket.png', '{"Chest":"40/42","Length":"27","Sleeves":"25"}', 'Classic vintage leather biker jacket. Heavy patina, broken-in feel.'),
  ('Cream Archive Hoodie', 'ARCHIVE', 'tops', 'XL', 'Chest 44', 2200, 'available', 'images/product-hoodie.png', '{"Chest":"44","Length":"28","Sleeves":"26"}', 'Heavyweight cream hoodie with vintage wash. Oversized fit.'),
  ('Designer Crossbody Bag', 'ARCHIVE', 'accessories', 'OS', 'One Size', 1500, 'sold', 'images/product-bag.png', '{"Height":"8","Width":"12","Depth":"3.5","Strap Drop":"22"}', 'Vintage designer crossbody in dark brown leather. Beautiful patina.'),
  ('Vintage Belt Silver Hardware', 'ARCHIVE', 'accessories', '32', 'Waist 32', 899, 'available', 'images/product-belt.png', '{"Length":"38","Width":"1.5"}', 'Black leather belt with aged silver hardware. Classic archive piece.'),
  ('Olive Cargo Wide-Leg', 'ARCHIVE', 'pants', '34', 'Waist 34', 1999, 'available', 'images/product-cargo.png', '{"Waist":"34","Rise":"11","Thigh":"24","Inseam":"30","Length":"41"}', 'Military-inspired olive cargo. Wide-leg cut, heavy cotton.'),
  ('Washed Black Graphic Tee', 'ARCHIVE', 'tops', 'L', 'Chest 42', 1100, 'sold', 'images/product-tshirt.png', '{"Chest":"42","Length":"28","Sleeves":"9"}', 'Faded vintage graphic tee in washed black. Single-stitch construction.'),
  ('Distressed Slim Denim', 'FREESOUL', 'denim', '28', 'Waist 28', 1400, 'available', 'images/product-sneakers.png', '{"Waist":"28","Rise":"9","Thigh":"20","Inseam":"30","Length":"38"}', 'FreeSoul slim fit distressed denim. Medium wash with whisker detail.'),
  ('Dark Wash Bootcut Jeans', 'HUGO BOSS', 'denim', '36', 'Waist 36', 2400, 'available', 'images/hero-jacket.png', '{"Waist":"36","Rise":"10.5","Thigh":"24","Inseam":"32","Length":"42"}', 'Hugo Boss dark wash bootcut. Heavier weight denim with subtle fading.');

-- Site Content
INSERT INTO site_content (section, data) VALUES
  ('hero', '{"badge":"EST. 2022","line1":"CURATED","line2":"VINTAGE &","line3":"ARCHIVE GRAILS","subtitle":"Every piece is 1 of 1. When it''s gone, it''s gone.","stat1Number":"105+","stat1Label":"Pieces Curated","stat2Number":"2.6K+","stat2Label":"Community","stat3Number":"🌍","stat3Label":"Ships Worldwide"}'),
  ('announcements', '["★ 1 OF 1 PIECES ONLY","★ SHIPS WORLDWIDE 🌍","★ DM TO COP","★ CURATED ARCHIVE GRAILS","★ SERIOUS BUYERS ONLY"]'),
  ('about', '{"tag":"THE STORY","title":"ONLY FOR HIGHLY<br>EDUCATED FASHION<br>PEOPLE","text1":"Grail Plug Supply is a curated archive fashion destination. We source dead-stock, vintage, and rare 1-of-1 pieces from brands like Hugo Boss Germany, FreeSoul, Armani, and more.","text2":"Every single piece in our collection is unique — one size, one piece, one chance. When it sells, it''s gone forever. No restocks. No replicas. Just pure, authenticated archive fashion.","values":[{"title":"Authenticated","desc":"Every piece verified before listing"},{"title":"1 of 1","desc":"No two pieces are the same"},{"title":"Worldwide Shipping","desc":"We ship to every corner of the globe"}]}'),
  ('reviews', '["\"Absolutely perfect piece, loved it\" ★★★★★","\"Got the drippp! 🔥\" ★★★★★","\"Legit seller, fast shipping\" ★★★★★","\"Quality is insane for the price\" ★★★★★","\"Best archive plug in India\" ★★★★★"]'),
  ('contact', '{"tag":"DM TO COP","title":"WANT A PIECE?","desc":"All purchases happen via Instagram DM. Tap below to start a conversation.","igHandle":"@grail_plug.co","igUrl":"https://www.instagram.com/grail_plug.co/"}'),
  ('footer', '{"tagline":"Curated Vintage & Archive Grails<br>Dead Grails Mostly.","copyright":"© 2026 Grail Plug Supply. All rights reserved.","bottomText":"Only for Highly Educated Fashion People."}'),
  ('drops', '{"tag":"NEW DROP","title":"LATEST DROP","desc":"Fresh pieces just landed. Pre-booking available."}'),
  ('collection', '{"tag":"1 OF 1","title":"SHOP BY YOUR SIZE","desc":"Every piece is unique. Find what fits you."}')
ON CONFLICT (section) DO NOTHING;
