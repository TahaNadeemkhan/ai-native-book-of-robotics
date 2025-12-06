-- Drop foreign key constraint from personalized_pages to lessons
-- We're using deterministic UUID5 from lesson URLs, not actual lesson table IDs
ALTER TABLE personalized_pages
DROP CONSTRAINT IF EXISTS fk_lesson_id;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_personalized_pages_lesson_id
ON personalized_pages(lesson_id);

-- Add composite index for cache lookups
CREATE INDEX IF NOT EXISTS idx_personalized_pages_user_lesson
ON personalized_pages(user_id, lesson_id);
