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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:w-auto sm:left-auto sm:translate-x-0 sm:right-5 sm:top-1/2 sm:-translate-y-1/2 sm:bottom-auto z-[999] flex sm:flex-col justify-around sm:justify-center sm:gap-3 items-center px-2 sm:px-4 pb-8 sm:pb-5 pt-3 sm:pt-5 bg-white/95 backdrop-blur-lg rounded-t-[32px] sm:rounded-[32px] border-t sm:border border-primary-100 shadow-[0_-10px_40px_rgba(173,44,78,0.15)] sm:shadow-[0_10px_40px_rgba(173,44,78,0.15)]">
      {navItems.map((item) => {
        const tabActive = activeTab === item.path;
        const navPath = item.path;

        return (
          <NavLink
            key={item.path}
            to={navPath}
            className={`flex flex-col items-center justify-center px-4 sm:px-7 py-2 sm:py-4 transition-all active:scale-90 duration-200 ${
              tabActive ? 'text-primary bg-primary-50 rounded-2xl' : 'text-on-surface-variant/50 hover:text-primary-400'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="material-symbols-outlined text-[24px] sm:text-[34px] transition-transform duration-200"
              style={tabActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-['Inter'] text-[11px] sm:text-[13px] font-semibold uppercase tracking-wider mt-1 sm:mt-1.5">
              {item.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
