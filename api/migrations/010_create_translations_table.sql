-- Create translations table for caching Urdu translations
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    translated_content TEXT NOT NULL,
    target_language VARCHAR(10) DEFAULT 'ur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_translations_user_lesson
ON translations(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_translations_lesson_id
ON translations(lesson_id);

-- Add unique constraint to prevent duplicate translations
CREATE UNIQUE INDEX IF NOT EXISTS idx_translations_unique_user_lesson_lang
ON translations(user_id, lesson_id, target_language);
