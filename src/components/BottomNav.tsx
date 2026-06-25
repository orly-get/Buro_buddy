import { NavLink, useLocation } from 'react-router-dom';
import { Home, Upload, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'בית' },
    { path: '/upload', icon: Upload, label: 'העלאה' },
    { path: '/letters', icon: FileText, label: 'מכתבים' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-primary-100 z-50 md:hidden">
      <div className="flex items-center justify-around py-2 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
              isActive(item.path)
                ? 'text-primary bg-primary-50'
                : 'text-primary-300 hover:text-primary-400'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-caption">{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={signOut}
          className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-primary-300 hover:text-primary-400 transition-all"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-caption">התנתק</span>
        </button>
      </div>
    </nav>
  );
}
