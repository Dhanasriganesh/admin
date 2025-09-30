-- Script to Drop Existing Columns from Packages Table
-- Run this FIRST before the migration script

-- Drop indexes first (if they exist)
DROP INDEX IF EXISTS idx_packages_route;
DROP INDEX IF EXISTS idx_packages_destination;
DROP INDEX IF EXISTS idx_packages_status;

-- Drop the columns we want to recreate
ALTER TABLE packages 
DROP COLUMN IF EXISTS route,
DROP COLUMN IF EXISTS plan_type,
DROP COLUMN IF EXISTS service_type,
DROP COLUMN IF EXISTS hotel_location_id,
DROP COLUMN IF EXISTS vehicle_location_id,
DROP COLUMN IF EXISTS selected_hotel_id,
DROP COLUMN IF EXISTS selected_vehicle_id,
DROP COLUMN IF EXISTS fixed_days_id,
DROP COLUMN IF EXISTS fixed_location_id,
DROP COLUMN IF EXISTS fixed_plan_id,
DROP COLUMN IF EXISTS fixed_adults,
DROP COLUMN IF EXISTS fixed_price_per_person,
DROP COLUMN IF EXISTS fixed_rooms_vehicle;

-- Verify columns are dropped
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'packages' 
ORDER BY ordinal_position;

