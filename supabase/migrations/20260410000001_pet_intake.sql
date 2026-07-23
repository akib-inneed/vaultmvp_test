-- Add item_type and pet_details columns to items table
ALTER TABLE items ADD COLUMN item_type text NOT NULL DEFAULT 'item';
ALTER TABLE items ADD COLUMN pet_details jsonb;
