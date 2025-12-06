-- Create summaries table for caching lesson summaries
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    summary_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_summaries_user_lesson
ON summaries(user_id, lesson_id);

CREATE INDEX IF NOT EXISTS idx_summaries_lesson_id
ON summaries(lesson_id);

-- Add unique constraint to prevent duplicate summaries
CREATE UNIQUE INDEX IF NOT EXISTS idx_summaries_unique_user_lesson
ON summaries(user_id, lesson_id);
