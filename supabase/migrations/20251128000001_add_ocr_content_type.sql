-- Add OCR image support to content_type
-- This migration adds 'ocr_image' as a valid content type for analysis history

-- Update the comment to reflect the new content type
COMMENT ON COLUMN public.analysis_history.content_type IS 'Content type: email, comment, review, text, or ocr_image';

-- No constraint exists, so no ALTER needed - just documentation update
-- The TypeScript types will now match the database schema
