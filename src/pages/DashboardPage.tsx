import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Letter, Category } from '../types';
import BottomNav from '../components/BottomNav';

interface LetterWithCategory extends Letter {
  category: Category | null;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [letters, setLetters] = useState<LetterWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract first name safely, fallback to 'חבר' (Friend) if undefined
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] 
    || user?.email?.split('@')[0] 
    || 'חבר';

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
      month: 'long',
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

  // Get only the most recent 3 letters
  const recentLetters = letters.slice(0, 3);

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32" dir="rtl">
      {/* TopAppBar */}
      <header className="px-6 py-4 w-full sticky top-0 z-50 bg-white shadow-[0_8px_30px_rgb(255,107,138,0.12)] rounded-b-[32px]">
        <div className="w-full max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container bg-surface-container">
              <img 
                alt="פרופיל משתמש" 
                className="w-full h-full object-cover scale-150" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGKdpXtcpX86zfVi7qNTaz1VKkAakAo8WFbTosIHBA2RoE14ILQuKd6DIKvpw_IoGydAWTmhkvsDG3Vx2znYsLIBftxTBsjdbK9fCHeUIpb4OwueTCrvAlqUwheFHof41fXAilM1OM4G--rkOPgU2VStioo5WL-TgqTm8fxd37fLFqMwG0lc3NH6it4wOQzrc3he6xnIi9R2EEmP_w0WXLZq2_tfxSHSnnCvSXDYEthsp1C_9bN0tHhtRauA9EGiaveqGEWLNdGIU" 
              />
            </div>
            <span className="text-2xl sm:text-lg font-black text-primary italic">BuroBuddy</span>
          </div>
          <button
            onClick={signOut}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl bg-primary-50 text-primary hover:bg-primary-100 hover:text-error transition-colors active:scale-95 duration-200"
            title="התנתק"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="page-enter px-5 pt-6 sm:pt-8 flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Hero Section: Scan Letter */}
        <section className="relative overflow-hidden rounded-[32px] sm:rounded-[24px] bg-white p-6 sm:p-5 shadow-[0_10px_40px_rgba(255,107,138,0.1)] border border-primary-50">
          <div className="relative z-10">
            <h1 className="font-h1 text-h1 sm:text-[20px] sm:leading-7 text-on-surface mb-1">שלום {firstName}, טוב לראות אותך</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 sm:mb-4">מוכן לטפל בניירת שלך היום?</p>
            <Link
              to="/upload"
              className="group w-full h-[180px] sm:h-[88px] bg-primary-container rounded-3xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-4 sm:px-6 text-on-primary shadow-[0_20px_50px_rgba(255,107,138,0.3)] hover:shadow-[0_24px_60px_rgba(255,107,138,0.4)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              style={{ textDecoration: 'none' }}
            >
              <div className="w-16 h-16 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mb-1 sm:mb-0 sm:shrink-0">
                <span className="material-symbols-outlined text-[40px] sm:text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
              </div>
              <div className="sm:text-right">
                <span className="font-button text-h2 sm:text-[17px] block">סריקת מכתב</span>
                <span className="font-caption text-white/80">הבינה המלאכותית תטפל בכל השאר</span>
              </div>
            </Link>
          </div>
          {/* Decorative abstract shapes */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-container/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl"></div>
        </section>



        {/* Recent Activity Section */}
        <section className="mb-8">
          <h2 className="font-h2 text-h2 text-on-surface mb-4">מכתבים אחרונים</h2>
          
          <div className="space-y-4">
            {recentLetters.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-primary-50 shadow-[0_4px_15px_rgba(255,107,138,0.05)] text-center">
                <p className="font-body-sm text-on-surface-variant">אין מכתבים להצגה</p>
              </div>
            ) : (
              recentLetters.map((letter) => (
                <Link 
                  to={`/letter/${letter.id}`} 
                  key={letter.id}
                  className={`bg-white p-4 rounded-2xl border border-primary-50 shadow-[0_4px_15px_rgba(255,107,138,0.05)] flex items-center gap-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(255,107,138,0.12)] active:scale-[0.98] ${letter.status === 'completed' ? 'opacity-70' : ''}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl opacity-50" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-button text-on-surface line-clamp-1">{letter.category?.name || 'ללא נושא'}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {letter.status === 'completed' ? (
                        <span className="font-caption text-on-surface-variant">הושלם ב-{formatDate(letter.created_at)}</span>
                      ) : (
                        <span className="font-caption text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded-full">{getStatusText(letter.status)}</span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">
                    {letter.status === 'completed' ? 'check_circle' : 'more_vert'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
