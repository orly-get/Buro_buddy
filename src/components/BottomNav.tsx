import { NavLink, useLocation } from 'react-router-dom';
import { Home, FileText, CheckSquare, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'בית' },
    { path: '/letters', icon: FileText, label: 'המכתבים שלי', activePath: '/dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'משימות', activePath: '/dashboard' },
    { path: '/profile', icon: User, label: 'פרופיל', activePath: '/dashboard' },
  ];

  const isActive = (item: typeof navItems[0]) => {
    if (item.path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (item.path === '/dashboard') return false;
    // For /letters, /tasks, /profile — highlight based on current path
    return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
  };

  // Determine which tab should be visually active
  const getActiveTab = () => {
    if (location.pathname === '/dashboard') return '/dashboard';
    if (location.pathname.startsWith('/letter')) return '/letters';
    if (location.pathname === '/letters') return '/letters';
    if (location.pathname === '/tasks') return '/tasks';
    if (location.pathname === '/profile') return '/profile';
    return '/dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: '#FFFFFF',
        borderTop: '1.5px solid #FFD6E0',
        height: '72px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const tabActive = activeTab === item.path;
          // /letters, /tasks, /profile all navigate to /dashboard since they're placeholders
          const navPath = item.activePath || item.path;

          return (
            <NavLink
              key={item.path}
              to={navPath}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-none transition-all"
              style={{ textDecoration: 'none' }}
            >
              <div
                className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all"
                style={{
                  background: tabActive ? '#FFF0F3' : 'transparent',
                }}
              >
                <item.icon
                  className="w-5 h-5"
                  style={{ color: tabActive ? '#AD2C4E' : '#C0A8B0' }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: tabActive ? '#AD2C4E' : '#C0A8B0' }}
                >
                  {item.label}
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
