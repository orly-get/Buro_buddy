-- Track when a letter actually became completed, separately from when it was created,
-- so the UI can show the real completion date instead of the upload date.
ALTER TABLE public.letters ADD COLUMN completed_at TIMESTAMPTZ;

-- Backfill: for letters that are already completed, we have no real completion
-- date on record, so approximate it with created_at rather than leaving it null.
UPDATE public.letters SET completed_at = created_at WHERE status = 'completed';
