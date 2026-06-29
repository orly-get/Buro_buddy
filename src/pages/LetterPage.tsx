import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { deriveCompletionStatus } from '../lib/letterStatus';
import { LetterWithDetails } from '../types';
import BottomNav from '../components/BottomNav';

export default function LetterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [letter, setLetter] = useState<LetterWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      fetchLetter();
    }
  }, [id]);

  async function fetchLetter() {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select(`
          *,
          ai_summaries (*),
          tasks (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setLetter(data);
    } catch (error) {
      console.error('Error fetching letter:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ is_completed: !isCompleted })
        .eq('id', taskId);

      if (error) throw error;

      // Recompute the letter's status from the post-toggle task set: 'completed'
      // once every task is checked, back to 'pending' if a task is unchecked.
      const nextTasks = (letter?.tasks ?? []).map((t) =>
        t.id === taskId ? { ...t, is_completed: !isCompleted } : t
      );
      const { error: statusError } = await supabase
        .from('letters')
        .update({ status: deriveCompletionStatus(nextTasks) })
        .eq('id', id);

      if (statusError) throw statusError;

      fetchLetter();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteLetter = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מכתב זה?')) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', letter?.id);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting letter:', error);
      setDeleting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDueDateStatus = (dueDate: string | null) => {
    if (!dueDate) return null;

    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `באיחור של ${Math.abs(diffDays)} ימים`, color: 'text-error bg-error/5 border-error/20' };
    } else if (diffDays === 0) {
      return { text: 'היום!', color: 'text-accent bg-accent/5 border-accent/20' };
    } else if (diffDays <= 7) {
      return { text: `בעוד ${diffDays} ימים`, color: 'text-accent bg-accent/5 border-accent/20' };
    } else {
      return { text: `בעוד ${diffDays} ימים`, color: 'text-primary-400 bg-primary-50 border-primary-100' };
    }
  };

  const summary = letter?.ai_summaries?.[0];
  const tasks = letter?.tasks || [];
  const completedTasks = tasks.filter(t => t.is_completed).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-safe">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-safe" dir="rtl">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-primary-300 mb-4">error</span>
          <h1 className="text-h1 text-text mb-2">מכתב לא נמצא</h1>
          <Link to="/dashboard" className="text-body text-primary hover:underline">
            חזרה לדאשבורד
          </Link>
        </div>
      </div>
    );
  }

  // Determine if there is any urgent pending task (due within 7 days)
  const hasUrgentTask = tasks.some(t => {
    if (t.is_completed || !t.due_date) return false;
    const due = new Date(t.due_date);
    const diffDays = Math.ceil((due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col font-body-lg text-on-surface" dir="rtl">
      <header className="bg-white shadow-[0_8px_30px_rgb(255,107,138,0.12)] px-4 py-4 w-full sticky top-0 z-50 rounded-b-[32px]">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl text-primary hover:bg-pink-50 transition-colors active:scale-95">
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-pink-500 italic">BuroBuddy</span>
          </div>

          <button 
            onClick={deleteLetter}
            disabled={deleting}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-error hover:bg-error/10 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-5 py-6 space-y-6 max-w-2xl mx-auto w-full">
        
        {/* Processing State Indicator */}
        {letter.status === 'processing' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="font-caption text-on-surface-variant">התקדמות עיבוד המכתב</span>
              <span className="font-caption text-primary font-bold">מעבד...</span>
            </div>
            <div className="w-full h-3 bg-secondary-fixed rounded-full overflow-hidden">
              <div className="h-full bg-primary w-1/2 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {letter.status === 'failed' && (
          <div className="flex justify-between items-center bg-error-container/30 px-4 py-2 rounded-2xl border border-error/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="font-caption text-error font-bold uppercase">שגיאה בניתוח</span>
            </div>
            <span className="font-h2 text-error">אירעה שגיאה</span>
          </div>
        )}

        {/* Urgent Tag (Only shows if an incomplete task is due soon) */}
        {hasUrgentTask && (
          <div className="flex justify-between items-center bg-error-container/30 px-4 py-2 rounded-2xl border border-error/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              <span className="font-caption text-error font-bold uppercase">מועד אחרון דחוף</span>
            </div>
            <span className="font-h2 text-error">שים לב!</span>
          </div>
        )}

        {/* BuroBuddy AI Bubble */}
        {summary && (
          <section className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
              </div>
              <div className="bg-white p-4 rounded-t-3xl rounded-bl-3xl shadow-[0_10px_30px_rgba(255,107,138,0.1)] border border-pink-50 relative w-full">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-h2 text-primary">BuroBuddy אומר</span>
                    <span className="bg-tertiary-container/20 text-tertiary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">סיכום AI</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(summary.summary_text)}
                    className="flex items-center gap-1 text-primary-400 hover:text-primary transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'הועתק!' : 'העתק'}</span>
                  </button>
                </div>
                <p className="font-body-lg text-on-surface leading-relaxed whitespace-pre-wrap">
                  {summary.summary_text}
                </p>
              </div>
            </div>
          </section>
        )}

        <h1 className="font-h1 text-on-surface px-1">{letter.category?.name || 'פירוט המכתב'}</h1>
        <p className="font-caption text-on-surface-variant px-1 -mt-4">{formatDate(letter.created_at)}</p>

        {/* Scanned Letter Visual Placeholder */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-100 to-rose-100 rounded-[20px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-white p-2 rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
            <div className="w-full h-48 bg-surface-container flex items-center justify-center rounded-xl opacity-80 group-hover:opacity-100 transition-all duration-500">
              <span className="material-symbols-outlined text-primary text-6xl opacity-30" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
            {letter.original_text && (
              <button 
                onClick={() => alert("הטקסט המקורי מוצג בתחתית העמוד")}
                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-pink-100 flex items-center gap-2 hover:bg-white transition-all"
              >
                <span className="material-symbols-outlined text-primary text-sm">zoom_in</span>
                <span className="font-button text-primary text-sm">צפה במקור</span>
              </button>
            )}
          </div>
        </div>

        {/* Key Action Items Card */}
        <section className="bg-white rounded-[32px] p-6 shadow-[0_20px_50px_rgba(255,107,138,0.08)] border border-pink-50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>checklist</span>
            </div>
            <h2 className="font-h1 text-on-surface">פעולות לביצוע ({completedTasks}/{tasks.length})</h2>
          </div>
          
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <p className="font-body-sm text-on-surface-variant text-center py-6">
                {letter.status === 'completed'
                  ? 'לא זוהו משימות במכתב זה'
                  : 'המשימות יופיעו לאחר הניתוח'}
              </p>
            ) : (
              tasks.map((task) => {
                const dueStatus = getDueDateStatus(task.due_date);
                return (
                  <label key={task.id} className="flex items-start gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-pink-50 transition-colors cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input 
                        type="checkbox" 
                        checked={task.is_completed}
                        onChange={() => toggleTask(task.id, task.is_completed)}
                        className="peer appearance-none w-6 h-6 rounded-lg border-2 border-pink-200 checked:bg-primary checked:border-primary transition-all duration-200" 
                      />
                      <span className="material-symbols-outlined absolute text-white text-[18px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">check</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-h2 text-on-surface group-peer-checked:line-through">{task.task_description}</p>
                      {task.due_date && dueStatus && !task.is_completed && (
                        <p className={`font-body-sm mt-1 inline-flex rounded-full px-2 py-0.5 border ${dueStatus.color}`}>
                          {dueStatus.text}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </section>

        {letter.original_text && (
          <details className="bg-white rounded-2xl p-6 shadow-[0_10px_30px_rgba(255,107,138,0.08)] border border-pink-50 group">
            <summary className="cursor-pointer flex items-center justify-between font-h2 text-on-surface hover:text-primary transition-colors outline-none list-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">text_snippet</span>
                טקסט מקורי סרוק
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <p className="font-body-sm text-on-surface-variant whitespace-pre-wrap border-t border-pink-100 pt-4 mt-4 leading-relaxed">
              {letter.original_text}
            </p>
          </details>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
