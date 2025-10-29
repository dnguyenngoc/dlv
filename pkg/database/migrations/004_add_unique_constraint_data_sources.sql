-- Add unique constraint for name and created_by combination
-- This ensures that each user can only have one source with a given name
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_name ON data_sources(created_by, name);
