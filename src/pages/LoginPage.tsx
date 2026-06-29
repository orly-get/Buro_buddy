import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateUsername, validatePassword } from '../lib/username';

export default function LoginPage() {
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const usernameCheck = validateUsername(username);
    if (!usernameCheck.ok) {
      setError(usernameCheck.error);
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.ok) {
      setError(passwordCheck.error);
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUpWithUsername(username, password);
      } else {
        await signInWithUsername(username, password);
      }
      // On success AuthContext updates `user`; PublicRoute redirects to /dashboard.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'אירעה שגיאה. נסו שוב.');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-[52px] px-md rounded-input bg-surface border border-primary-200 focus:border-primary outline-none text-on-surface';

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col" dir="rtl">
      <main className="flex-1 px-margin-mobile pt-xl pb-xl flex flex-col justify-center">
        <h1 className="text-h1 text-on-surface text-center mb-lg">
          {mode === 'login' ? 'התחברות' : 'הרשמה'}
        </h1>

        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-md">
          <div>
            <label className="block text-body-sm text-on-surface-variant mb-xs" htmlFor="username">
              שם משתמש
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-body-sm text-on-surface-variant mb-xs" htmlFor="password">
              סיסמה
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-body-sm text-on-surface-variant mb-xs" htmlFor="confirm-password">
                אימות סיסמה
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {error && (
            <p className="text-error text-body-sm text-center" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[56px] bg-primary-container text-on-primary rounded-full text-button shadow-[0_10px_25px_rgba(255,107,138,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting ? 'רגע...' : mode === 'login' ? 'התחבר' : 'הרשמה'}
          </button>
        </form>

        <p className="text-center text-body-sm text-on-surface-variant mt-lg">
          {mode === 'login' ? 'אין לך חשבון?' : 'יש לך כבר חשבון?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-primary font-bold"
          >
            {mode === 'login' ? 'הרשמה' : 'התחברות'}
          </button>
        </p>

        <Link to="/" className="text-center text-body-sm text-on-surface-variant mt-md hover:text-on-surface">
          חזרה
        </Link>
      </main>
    </div>
  );
}
