import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import UsersPage from './pages/Users.jsx';
import RolesPage from './pages/Roles.jsx';
import BranchesPage from './pages/Branches.jsx';
import AuditLogPage from './pages/AuditLog.jsx';
import CategoriesPage from './pages/Categories.jsx';
import UnitsPage from './pages/Units.jsx';
import ItemsPage from './pages/Items.jsx';
import StockPage from './pages/Stock.jsx';
import AccountPage from './pages/Account.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-ink/40">جارٍ التحميل...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
      <Route path="/roles" element={<ProtectedRoute><RolesPage /></ProtectedRoute>} />
      <Route path="/branches" element={<ProtectedRoute><BranchesPage /></ProtectedRoute>} />
      <Route path="/audit-log" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
      <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/units" element={<ProtectedRoute><UnitsPage /></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute><ItemsPage /></ProtectedRoute>} />
      <Route path="/stock" element={<ProtectedRoute><StockPage /></ProtectedRoute>} />
      <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
