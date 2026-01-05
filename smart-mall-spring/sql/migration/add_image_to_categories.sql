-- Add image column to categories table
ALTER TABLE categories ADD COLUMN image VARCHAR(500) AFTER description;
