import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function WelcomePage() {
  const { signInWithGoogle, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary-100 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col" dir="rtl">
      {/* Main Content Canvas */}
      <main className="page-enter flex-1 px-margin-mobile py-lg flex flex-col items-center justify-center text-center lg:flex-row lg:gap-16 lg:max-w-5xl lg:mx-auto lg:text-right lg:py-0">
        {/* Illustration Container */}
        <div className="relative w-full max-w-[240px] sm:max-w-sm aspect-square mb-md lg:mb-0 lg:max-w-md lg:w-1/2 lg:shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary-fixed-dim opacity-20 rounded-full blur-3xl"></div>
          <img
            className="relative z-10 w-44 h-44 sm:w-64 sm:h-64 lg:w-72 lg:h-72 drop-shadow-xl"
            alt="A friendly, rounded AI character with soft, squishy features and expressive digital eyes, designed in a modern 3D claymorphism style. The character is colored in soft whites and primary pink accents, holding a paper letter and smiling warmly. The setting is a bright, airy space with floating geometric shapes in pastel pinks. The mood is encouraging, helpful, and technologically sophisticated yet approachable."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGKdpXtcpX86zfVi7qNTaz1VKkAakAo8WFbTosIHBA2RoE14ILQuKd6DIKvpw_IoGydAWTmhkvsDG3Vx2znYsLIBftxTBsjdbK9fCHeUIpb4OwueTCrvAlqUwheFHof41fXAilM1OM4G--rkOPgU2VStioo5WL-TgqTm8fxd37fLFqMwG0lc3NH6it4wOQzrc3he6xnIi9R2EEmP_w0WXLZq2_tfxSHSnnCvSXDYEthsp1C_9bN0tHhtRauA9EGiaveqGEWLNdGIU"
          />
        </div>

        <div className="w-full flex flex-col items-center lg:items-end lg:w-1/2">
          {/* Headline & Copy */}
          <div className="space-y-sm mb-md lg:mb-lg">
            <h2 className="font-h1 text-h1 text-on-surface">בירוקרטיה? זה פשוט.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[280px] mx-auto lg:mx-0 lg:max-w-sm">
              אעזור לך לפענח מכתבים, לעקוב אחר מועדים ולנהל את הלחץ של הניירת.
            </p>
          </div>

          {/* Bento Grid Feature Highlight */}
          <div className="grid grid-cols-2 gap-md w-full max-w-md mb-md lg:mb-lg">
            <div className="bg-surface-container-lowest p-md rounded-[24px] shadow-[0_8px_20px_rgba(255,107,138,0.08)] flex flex-col items-start gap-xs text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,107,138,0.14)]">
              <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>auto_awesome</span>
              <p className="font-caption text-caption text-on-surface font-bold">תרגום AI</p>
              <p className="font-body-sm text-caption text-on-surface-variant">הופך שפה משפטית מסובכת לעברית פשוטה.</p>
            </div>
            <div className="bg-surface-container-lowest p-md rounded-[24px] shadow-[0_8px_20px_rgba(255,107,138,0.08)] flex flex-col items-start gap-xs text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,107,138,0.14)]">
              <span className="material-symbols-outlined text-primary mb-xs" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>alarm</span>
              <p className="font-caption text-caption text-on-surface font-bold">התראות חכמות</p>
              <p className="font-body-sm text-caption text-on-surface-variant">לעולם לא תפספסו שוב מועד להגשת מסמכים.</p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={signInWithGoogle}
            className="w-full max-w-md h-[52px] sm:h-[56px] bg-primary-container text-on-primary rounded-full font-button text-button shadow-[0_10px_25px_rgba(255,107,138,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-base mb-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            התחבר עם גוגל
          </button>
          <Link
            to="/login"
            className="w-full max-w-md h-[48px] sm:h-[52px] bg-surface border border-primary-200 text-on-surface rounded-full text-button flex items-center justify-center hover:border-primary active:scale-95 transition-all"
          >
            התחבר עם שם משתמש
          </Link>
        </div>
      </main>
    </div>
  );
}
