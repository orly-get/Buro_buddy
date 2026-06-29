import { NavLink, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'home_app_logo', label: 'בית' },
    { path: '/letters', icon: 'history_edu', label: 'המכתבים שלי' },
    { path: '/upload', icon: 'document_scanner', label: 'סריקה' },
    { path: '/profile', icon: 'person', label: 'פרופיל' },
  ];

  // Determine which tab should be visually active
  const getActiveTab = () => {
    if (location.pathname === '/dashboard') return '/dashboard';
    if (location.pathname.startsWith('/letter')) return '/letters';
    if (location.pathname === '/letters') return '/letters';
    if (location.pathname === '/upload') return '/upload';
    if (location.pathname === '/profile') return '/profile';
    return '/dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-xl z-[999] flex justify-around items-center px-2 pb-8 pt-3 bg-white/95 backdrop-blur-lg rounded-t-[32px] border-t border-pink-100 shadow-[0_-10px_40px_rgba(255,107,138,0.15)]">
      {navItems.map((item) => {
        const tabActive = activeTab === item.path;
        const navPath = item.path;

        return (
          <NavLink
            key={item.path}
            to={navPath}
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-150 ${
              tabActive ? 'text-pink-500 bg-pink-50 rounded-2xl' : 'text-gray-400 hover:text-pink-400'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <span 
              className="material-symbols-outlined" 
              style={tabActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] text-[11px] font-semibold uppercase tracking-wider mt-1">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
