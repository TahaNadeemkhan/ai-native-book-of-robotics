ALTER TABLE personalized_pages
DROP COLUMN IF EXISTS page_path;

ALTER TABLE personalized_pages
ADD COLUMN lesson_id UUID NOT NULL;

ALTER TABLE personalized_pages
ADD COLUMN calibration_snapshot JSONB NOT NULL DEFAULT '{}';

ALTER TABLE personalized_pages
ADD CONSTRAINT fk_lesson_id
FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
