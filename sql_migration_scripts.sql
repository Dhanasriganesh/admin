-- SQL Migration Scripts for Packages Table
-- Run these in Supabase SQL Editor

-- 1. Add new columns if they don't exist
ALTER TABLE packages 
ADD COLUMN IF NOT EXISTS route VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS hotel_location_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS vehicle_location_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS selected_hotel_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS selected_vehicle_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS fixed_days_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS fixed_location_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS fixed_plan_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS fixed_adults INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_price_per_person DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fixed_rooms_vehicle VARCHAR(255);

-- 2. Update existing records to have proper structure
-- Set route to destination for existing records (backwards compatibility)
UPDATE packages 
SET route = destination 
WHERE route IS NULL OR route = '';

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_route ON packages(route);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);

-- 4. Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'packages' 
ORDER BY ordinal_position;

-- 5. Check current data
SELECT id, name, destination, route, status, created_at 
FROM packages 
ORDER BY created_at DESC 
LIMIT 10;

