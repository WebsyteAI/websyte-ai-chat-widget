-- Update existing null recommendations to empty array
UPDATE widget 
SET recommendations = '[]'::jsonb 
WHERE recommendations IS NULL;

-- Set default value for recommendations column
ALTER TABLE widget 
ALTER COLUMN recommendations SET DEFAULT '[]'::jsonb;