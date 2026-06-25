import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Letter, Category } from '../types';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, LogOut, Upload } from 'lucide-react';
import BottomNav from '../components/BottomNav';

interface LetterWithCategory extends Letter {
  category: Category | null;
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusIcon = (status: Letter['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-primary border-t-primary-400 rounded-full animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-primary-300" />;
    }
  };

  const getStatusText = (status: Letter['status']) => {
    switch (status) {
      case 'completed':
        return 'הושלם';
      case 'processing':
        return 'מעבד...';
      case 'failed':
        return 'שגיאה';
      default:
        return 'ממתין';
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
    <div className="min-h-screen bg-background pb-safe" dir="rtl">
      <header className="bg-surface border-b border-primary-100 sticky top-0 z-10 hidden md:block">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-h2 text-text">BuroBuddy</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-body text-primary-400">
              {user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="btn-outline flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              התנתק
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h1 text-text">המכתבים שלי</h1>
            <p className="text-body text-primary-400 mt-1">נהל את המכתבים הבירוקרטיים שלך</p>
          </div>

          <Link
            to="/upload"
            className="btn-primary flex items-center gap-2 hidden md:flex"
          >
            <Plus className="w-5 h-5" />
            העלה מכתב חדש
          </Link>
        </div>

        {letters.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-primary-50 rounded-card flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-primary-300" />
            </div>
            <h2 className="text-h2 text-text mb-2">
              אין לך מכתבים עדיין
            </h2>
            <p className="text-body text-primary-400 mb-6">
              התחל בהעלאת המכתב הראשון שלך
            </p>
            <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
              <Upload className="w-5 h-5" />
              העלה מכתב חדש
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {letters.map((letter) => (
              <Link
                key={letter.id}
                to={`/letter/${letter.id}`}
                className="card hover:shadow-soft transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {letter.category && (
                          <span className="text-caption bg-primary-100 text-primary px-2 py-0.5 rounded-full">
                            {letter.category.name}
                          </span>
                        )}
                        <span className="text-caption text-primary-300">
                          {formatDate(letter.created_at)}
                        </span>
                      </div>
                      <p className="text-body text-text line-clamp-2">
                        {letter.original_text
                          ? letter.original_text.substring(0, 100) + '...'
                          : 'מכתב חדש'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(letter.status)}
                    <span className="text-caption text-primary-400 hidden sm:inline">
                      {getStatusText(letter.status)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      <Link
        to="/upload"
        className="fixed bottom-24 left-1/2 -translate-x-1/2 btn-primary w-14 h-14 rounded-full flex items-center justify-center shadow-lg md:hidden z-40"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
