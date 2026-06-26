import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const exchangeAttempted = useRef(false);

  useEffect(() => {
    // Once the user state is set in the AuthContext, safely navigate to dashboard
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const handleAuthCallback = async () => {
      if (exchangeAttempted.current) return;
      exchangeAttempted.current = true;

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          // After successful exchange, onAuthStateChange in AuthContext will trigger,
          // updating the user state, which will be caught by the first useEffect.
        } else {
          // If no code, check if we already have a session
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error exchanging code for session:', error);
        navigate('/', { replace: true });
      }
    };

    if (!user && !loading) {
      handleAuthCallback();
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        <p className="text-slate-600 font-medium">מתחבר למערכת...</p>
      </div>
    </div>
  );
}
