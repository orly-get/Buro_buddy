export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Letter {
  id: string;
  user_id: string;
  category_id: string | null;
  file_url: string;
  original_text: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
  category?: Category | null;
}

export interface AISummary {
  id: string;
  letter_id: string;
  summary_text: string;
  created_at: string;
}

export interface Task {
  id: string;
  letter_id: string;
  task_description: string;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface LetterWithDetails extends Letter {
  ai_summaries: AISummary[];
  tasks: Task[];
}
