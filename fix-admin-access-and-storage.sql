-- =============================================
-- GRAIL PLUG — Fix Admin Access + Storage Setup
-- Run this ENTIRE script in Supabase SQL Editor
-- =============================================

-- ============================================
-- PART 1: FIX RLS POLICIES (all 4 admin emails)
-- ============================================

-- Enable RLS on all tables (safe to re-run)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_insert" ON products;
DROP POLICY IF EXISTS "products_update" ON products;
DROP POLICY IF EXISTS "products_delete" ON products;

DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_insert" ON categories;
DROP POLICY IF EXISTS "categories_update" ON categories;
DROP POLICY IF EXISTS "categories_delete" ON categories;

DROP POLICY IF EXISTS "orders_admin_select" ON orders;
DROP POLICY IF EXISTS "orders_user_insert" ON orders;
DROP POLICY IF EXISTS "orders_admin_update" ON orders;

DROP POLICY IF EXISTS "content_select" ON site_content;
DROP POLICY IF EXISTS "content_insert" ON site_content;
DROP POLICY IF EXISTS "content_update" ON site_content;

-- ── Products ──
CREATE POLICY "products_select" ON products FOR SELECT USING (true);

CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "products_update" ON products FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "products_delete" ON products FOR DELETE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

-- ── Categories ──
CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);

CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "categories_update" ON categories FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "categories_delete" ON categories FOR DELETE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

-- ── Orders ──
CREATE POLICY "orders_admin_select" ON orders FOR SELECT USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "orders_user_insert" ON orders FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

CREATE POLICY "orders_admin_update" ON orders FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

-- ── Site Content ──
CREATE POLICY "content_select" ON site_content FOR SELECT USING (true);

CREATE POLICY "content_insert" ON site_content FOR INSERT WITH CHECK (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);

CREATE POLICY "content_update" ON site_content FOR UPDATE USING (
  (SELECT auth.jwt() ->> 'email') IN (
    'checkstudio01@gmail.com',
    'tejugiri549@gmail.com',
    'grailplug7@gmail.com',
    'adiphurailatpam76@gmail.com'
  )
);


-- =============================================
-- PART 2: PRODUCT IMAGE STORAGE BUCKET + POLICIES
-- =============================================

-- Create the storage bucket (public for read access)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies (safe if they don't exist)
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;

-- Public read: anyone can view product images
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Admin upload: only admin emails can upload images
CREATE POLICY "product_images_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND (SELECT auth.jwt() ->> 'email') IN (
      'checkstudio01@gmail.com',
      'tejugiri549@gmail.com',
      'grailplug7@gmail.com',
      'adiphurailatpam76@gmail.com'
    )
  );

-- Admin update: only admin emails can replace images
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'product-images'
    AND (SELECT auth.jwt() ->> 'email') IN (
      'checkstudio01@gmail.com',
      'tejugiri549@gmail.com',
      'grailplug7@gmail.com',
      'adiphurailatpam76@gmail.com'
    )
  );

-- Admin delete: only admin emails can delete images
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND (SELECT auth.jwt() ->> 'email') IN (
      'checkstudio01@gmail.com',
      'tejugiri549@gmail.com',
      'grailplug7@gmail.com',
      'adiphurailatpam76@gmail.com'
    )
  );
