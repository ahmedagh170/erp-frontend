import { LogOut, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-sand" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 bg-white border-b border-black/5 sticky top-0 z-10">
          <h1 className="text-lg font-bold text-ink">{title}</h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-sand transition-colors">
              <Bell size={19} className="text-ink/60" />
            </button>
            <div className="h-8 w-px bg-black/10" />
            <Link to="/account" className="text-left hover:opacity-70 transition-opacity">
              <div className="text-sm font-medium text-ink">{user?.full_name}</div>
              <div className="text-xs text-ink/50">{user?.role_name}</div>
            </Link>
            <button
              onClick={logout}
              className="p-2 rounded-full hover:bg-red-50 hover:text-red-500 text-ink/50 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
