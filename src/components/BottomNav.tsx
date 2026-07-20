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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:w-fit md:bottom-5 z-[999] flex justify-around md:justify-center md:gap-2 items-center px-2 md:px-3 pb-8 md:pb-3 pt-3 bg-white/95 backdrop-blur-lg rounded-t-[32px] md:rounded-full border-t md:border border-primary-100 shadow-[0_-10px_40px_rgba(173,44,78,0.15)] md:shadow-[0_10px_40px_rgba(173,44,78,0.15)]">
      {navItems.map((item) => {
        const tabActive = activeTab === item.path;
        const navPath = item.path;

        return (
          <NavLink
            key={item.path}
            to={navPath}
            className={`flex flex-col items-center justify-center px-4 py-2 transition-all active:scale-90 duration-200 ${
              tabActive ? 'text-primary bg-primary-50 rounded-2xl' : 'text-on-surface-variant/50 hover:text-primary-400'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <span
              className="material-symbols-outlined transition-transform duration-200"
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
