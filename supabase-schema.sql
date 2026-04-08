-- ============================================================================
-- CarDealer Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- 1. Cars table
CREATE TABLE cars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year integer NOT NULL,
  price numeric NOT NULL,
  condition text NOT NULL CHECK (condition IN ('new', 'used')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  featured boolean NOT NULL DEFAULT false,
  fuel_type text NOT NULL,
  transmission text NOT NULL,
  color text DEFAULT '',
  body_type text NOT NULL,
  mileage integer DEFAULT 0,
  doors integer DEFAULT 4,
  seats integer DEFAULT 5,
  battery_range integer DEFAULT 0,
  description_en text DEFAULT '',
  features text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cars_slug ON cars(slug);
CREATE INDEX idx_cars_brand ON cars(brand);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_cars_featured ON cars(featured) WHERE featured = true;
CREATE INDEX idx_cars_created_at ON cars(created_at DESC);

-- 2. Inquiries table
CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  car text NOT NULL,
  car_title text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- 3. Settings singleton table
CREATE TABLE settings (
  id text PRIMARY KEY DEFAULT 'main',
  dealership_name text DEFAULT '',
  dealership_address text DEFAULT '',
  dealership_city text DEFAULT '',
  dealership_country text DEFAULT '',
  dealership_phone text DEFAULT '',
  dealership_email text DEFAULT '',
  admin_email text DEFAULT '',
  admin_phone text DEFAULT '',
  admin_whatsapp text DEFAULT '',
  notification_method text DEFAULT 'email',
  emailjs_service_id text DEFAULT '',
  emailjs_template_id text DEFAULT '',
  emailjs_public_key text DEFAULT '',
  twilio_account_sid text DEFAULT '',
  twilio_auth_token text DEFAULT '',
  twilio_from_number text DEFAULT '',
  hero_headline_en text DEFAULT '',
  hero_subtitle_en text DEFAULT '',
  social_instagram text DEFAULT '',
  social_facebook text DEFAULT '',
  logo text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cars_updated_at BEFORE UPDATE ON cars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. Row Level Security
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Cars: public read, authenticated write
CREATE POLICY "cars_select" ON cars FOR SELECT USING (true);
CREATE POLICY "cars_insert" ON cars FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "cars_update" ON cars FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "cars_delete" ON cars FOR DELETE USING (auth.role() = 'authenticated');

-- Inquiries: public insert (anyone can submit), authenticated read/update/delete
CREATE POLICY "inquiries_insert" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_select" ON inquiries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inquiries_update" ON inquiries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "inquiries_delete" ON inquiries FOR DELETE USING (auth.role() = 'authenticated');

-- Settings: public read, authenticated write
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Storage bucket for car images
-- Run this separately or create via Supabase Dashboard → Storage → New Bucket
-- Name: car-images, Public: true
INSERT INTO storage.buckets (id, name, public) VALUES ('car-images', 'car-images', true);

-- Storage policies: public read, authenticated upload/delete
CREATE POLICY "car_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "car_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');
CREATE POLICY "car_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'car-images' AND auth.role() = 'authenticated');
