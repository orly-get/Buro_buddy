-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Categories for letters
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

-- Default categories
INSERT INTO public.categories (name) VALUES
  ('ביטוח לאומי'),
  ('מס הכנסה'),
  ('עירייה'),
  ('בנק'),
  ('בריאות'),
  ('חינוך'),
  ('אחר');

-- Letters table
CREATE TABLE public.letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  file_url TEXT NOT NULL,
  original_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Summaries table
CREATE TABLE public.ai_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  due_date DATE,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "select_own_user" ON public.users FOR SELECT
  TO authenticated USING (auth.uid() = id);
CREATE POLICY "insert_own_user" ON public.users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "update_own_user" ON public.users FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- RLS Policies for categories (read-only for all authenticated)
CREATE POLICY "select_categories" ON public.categories FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for letters
CREATE POLICY "select_own_letters" ON public.letters FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_letters" ON public.letters FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_letters" ON public.letters FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_letters" ON public.letters FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for ai_summaries
CREATE POLICY "select_own_summaries" ON public.ai_summaries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = ai_summaries.letter_id AND letters.user_id = auth.uid())
  );
CREATE POLICY "insert_own_summaries" ON public.ai_summaries FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = ai_summaries.letter_id AND letters.user_id = auth.uid())
  );

-- RLS Policies for tasks
CREATE POLICY "select_own_tasks" ON public.tasks FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = tasks.letter_id AND letters.user_id = auth.uid())
  );
CREATE POLICY "insert_own_tasks" ON public.tasks FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = tasks.letter_id AND letters.user_id = auth.uid())
  );
CREATE POLICY "update_own_tasks" ON public.tasks FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = tasks.letter_id AND letters.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = tasks.letter_id AND letters.user_id = auth.uid())
  );
CREATE POLICY "delete_own_tasks" ON public.tasks FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM public.letters WHERE letters.id = tasks.letter_id AND letters.user_id = auth.uid())
  );

-- Function to automatically create user on first login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Index for faster queries
CREATE INDEX idx_letters_user_id ON public.letters(user_id);
CREATE INDEX idx_tasks_letter_id ON public.tasks(letter_id);
CREATE INDEX idx_summaries_letter_id ON public.ai_summaries(letter_id);