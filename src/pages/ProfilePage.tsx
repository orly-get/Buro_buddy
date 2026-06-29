import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const { user, signOut } = useAuth();

  const fullName = user?.user_metadata?.full_name || 'משתמש לא ידוע';

  return (
    <div className="min-h-screen bg-background pb-32 flex flex-col font-body-lg text-on-surface" dir="rtl">
      {/* TopAppBar */}
      <header className="bg-white shadow-[0_8px_30px_rgb(255,107,138,0.12)] flex justify-center items-center px-4 py-4 w-full sticky top-0 z-50 rounded-b-[32px]">
        <span className="text-xl font-black text-on-surface">הפרופיל שלי</span>
      </header>

      <main className="flex-1 max-w-xl mx-auto px-5 py-6 space-y-6 w-full">
        {/* Profile Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_rgba(255,107,138,0.1)] border border-pink-50 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-container bg-surface-container shadow-lg mb-4">
            <img 
              alt="פרופיל משתמש" 
              className="w-full h-full object-cover scale-150" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGKdpXtcpX86zfVi7qNTaz1VKkAakAo8WFbTosIHBA2RoE14ILQuKd6DIKvpw_IoGydAWTmhkvsDG3Vx2znYsLIBftxTBsjdbK9fCHeUIpb4OwueTCrvAlqUwheFHof41fXAilM1OM4G--rkOPgU2VStioo5WL-TgqTm8fxd37fLFqMwG0lc3NH6it4wOQzrc3he6xnIi9R2EEmP_w0WXLZq2_tfxSHSnnCvSXDYEthsp1C_9bN0tHhtRauA9EGiaveqGEWLNdGIU" 
            />
          </div>
          <h2 className="font-h1 text-2xl text-on-surface mb-1">{fullName}</h2>
          <p className="font-body-sm text-on-surface-variant mb-6">{user?.email}</p>
          
          <button 
            onClick={signOut}
            className="w-full h-[48px] flex items-center justify-center gap-2 rounded-full bg-error-container text-error hover:bg-error/20 transition-all font-button active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>התנתק מהמערכת</span>
          </button>
        </div>

        {/* Support Section */}
        <section className="bg-white rounded-[32px] p-6 shadow-[0_10px_30px_rgba(255,107,138,0.08)] border border-pink-50">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
            <h3 className="font-h2 text-on-surface">צריכים עזרה?</h3>
          </div>
          <div className="space-y-3">
            <a href="mailto:support@burobuddy.com" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-pink-50 transition-colors">
              <div className="w-10 h-10 bg-secondary-container/20 text-secondary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">mail</span>
              </div>
              <div>
                <p className="font-button text-on-surface">פנו אלינו במייל</p>
                <p className="font-caption text-on-surface-variant">support@burobuddy.com</p>
              </div>
            </a>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
