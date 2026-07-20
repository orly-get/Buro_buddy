import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Letter, Category } from '../types';
import BottomNav from '../components/BottomNav';

interface LetterWithCategory extends Letter {
  category: Category | null;
}

export default function LettersPage() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LetterWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLetters();
    }
  }, [user]);

  async function fetchLetters() {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*, category:categories(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusText = (status: Letter['status']) => {
    switch (status) {
      case 'completed':
        return 'טופל';
      case 'processing':
        return 'מעבד...';
      case 'failed':
        return 'שגיאה';
      default:
        return 'נדרש טיפול';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pb-safe">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32" dir="rtl">
      <header className="bg-white shadow-[0_8px_30px_rgb(255,107,138,0.12)] px-6 py-4 w-full sticky top-0 z-50 rounded-b-[32px]">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden">
              {/* Generic placeholder profile image */}
              <img
                className="w-full h-full object-cover"
                alt="Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGW6W4rQKt4Tc1IFi2vmdOL1vVj28FNwCW2_1l38_oMPHQ_4QaYmOzNZm0cXW67TqdSXTHQ28rCDS34bWi9OrZ9cRW5QsOAA174NtK9vC7QZFCEqzPdrx8im2RCKmhJEUm5zhQ3Kvn7DBwXAQ7FvT7N6yrvhcJT88QlYJG54JTUp_RGyqe7V0ws9SP-nGHFpuudcFiwMu1xLiKxXFfVXfWnAbsPsg5Le5R4oxPeSvsQ7N5LQd_7voEhxDUBA1BF90LZALLmJ4lik4"
              />
            </div>
            <span className="text-2xl font-black text-primary italic">BuroBuddy</span>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-primary-50 transition-colors active:scale-95 duration-200">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
        </div>
      </header>

      <main className="page-enter px-5 pt-8 max-w-2xl mx-auto">
        <section className="mb-8 text-right">
          <h1 className="font-h1 text-h1 text-on-surface mb-2">המכתבים שלי</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            עקבו אחר המסמכים הסרוקים והמשימות הקרובות שלכם.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          {letters.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-primary-300 mb-4" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200, 'GRAD' 0, 'opsz' 48" }}>inbox</span>
              <h2 className="text-h2 text-text mb-2">אין לך מכתבים עדיין</h2>
              <p className="text-body text-primary-400 mb-6">התחל בהעלאת המכתב הראשון שלך</p>
              <Link to="/upload" className="inline-flex items-center justify-center gap-2 h-[48px] px-6 bg-primary-container text-on-primary rounded-full font-button text-button shadow-[0_4px_15px_rgba(255,107,138,0.3)] active:scale-95 transition-all">
                <span className="material-symbols-outlined">add_a_photo</span>
                סריקת מכתב חדש
              </Link>
            </div>
          ) : (
            letters.map((letter) => (
              <Link
                to={`/letter/${letter.id}`}
                key={letter.id}
                className="bg-white rounded-[16px] p-4 flex items-center gap-4 shadow-[0_8px_20px_rgba(255,107,138,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,107,138,0.14)] active:scale-[0.98] group"
              >
                <div className="w-16 h-20 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-primary-50 flex items-center justify-center">
                   <span className="material-symbols-outlined text-primary text-3xl opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-h2 text-h2 text-on-surface leading-tight">
                      {letter.category?.name || 'ללא נושא'}
                    </h3>
                    <span 
                      className={`font-caption text-caption px-3 py-1 rounded-full ${
                        letter.status === 'completed' 
                          ? 'bg-surface-container text-on-surface-variant' 
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {getStatusText(letter.status)}
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-2 line-clamp-1">
                    {letter.original_text ? letter.original_text.substring(0, 60) + '...' : 'מכתב חדש'}
                  </p>
                  <div className={`flex items-center gap-2 ${letter.status === 'completed' ? 'text-on-surface-variant/60' : 'text-primary'}`}>
                    <span className="material-symbols-outlined text-[18px]">
                      {letter.status === 'completed' ? 'check_circle' : 'calendar_today'}
                    </span>
                    <span className="font-caption text-caption">
                      {letter.status === 'completed' ? `הושלם ב-${formatDate(letter.created_at)}` : formatDate(letter.created_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>

        {letters.length > 0 && (
          <section className="mt-8 mb-4">
            <Link
              to="/upload"
              className="w-full h-[48px] bg-primary-container text-on-primary rounded-full font-button text-button shadow-[0_4px_15px_rgba(255,107,138,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all block text-center leading-[48px]"
              style={{ textDecoration: 'none' }}
            >
              <span className="material-symbols-outlined align-middle">add_a_photo</span>
              <span className="align-middle">סריקת מכתב חדש</span>
            </Link>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
