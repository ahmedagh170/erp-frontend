import { useEffect, useState } from 'react';
import { Plus, Search, Power, X } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function UsersPage() {
  const { can } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', fullName: '', email: '', roleId: '', branchId: '', password: '' });

  async function loadUsers() {
    const { data } = await apiClient.get('/users', { params: { search } });
    setUsers(data.users);
  }

  useEffect(() => {
    loadUsers();
    apiClient.get('/roles').then(({ data }) => setRoles(data.roles));
    apiClient.get('/branches').then(({ data }) => setBranches(data.branches));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/users', {
        ...form,
        branchId: form.branchId || null,
        email: form.email || ''
      });
      setShowModal(false);
      setForm({ username: '', fullName: '', email: '', roleId: '', branchId: '', password: '' });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إضافة المستخدم');
    }
  }

  async function toggleActive(id) {
    await apiClient.patch(`/users/${id}/toggle-active`);
    loadUsers();
  }

  return (
    <Layout title="إدارة المستخدمين">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            className="input-field pr-10"
            placeholder="ابحث بالاسم أو اسم المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {can('users.create') && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} /> إضافة مستخدم
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink/60 text-xs">
            <tr>
              <th className="text-right px-5 py-3 font-medium">الاسم الكامل</th>
              <th className="text-right px-5 py-3 font-medium">اسم المستخدم</th>
              <th className="text-right px-5 py-3 font-medium">الدور</th>
              <th className="text-right px-5 py-3 font-medium">الفرع</th>
              <th className="text-right px-5 py-3 font-medium">آخر دخول</th>
              <th className="text-right px-5 py-3 font-medium">الحالة</th>
              {can('users.delete') && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-sand/50">
                <td className="px-5 py-3 font-medium text-ink">{u.full_name}</td>
                <td className="px-5 py-3 text-ink/60">{u.username}</td>
                <td className="px-5 py-3 text-ink/60">{u.role_name}</td>
                <td className="px-5 py-3 text-ink/60">{u.branch_name || '—'}</td>
                <td className="px-5 py-3 text-ink/40 text-xs">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString('ar-EG') : 'لم يسجّل الدخول بعد'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${u.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {u.is_active ? 'نشط' : 'معطّل'}
                  </span>
                </td>
                {can('users.delete') && (
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(u.id)} className="text-ink/40 hover:text-primary-600" title="تفعيل / تعطيل">
                      <Power size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={7} className="text-center py-8 text-ink/40">لا يوجد مستخدمون مطابقون</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">إضافة مستخدم جديد</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">الاسم الكامل</label>
                <input required className="input-field" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">اسم المستخدم</label>
                <input required className="input-field" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div>
                <label className="label">البريد الإلكتروني (اختياري)</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">الدور</label>
                <select required className="input-field" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                  <option value="">اختر دورًا</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الفرع (اختياري)</label>
                <select className="input-field" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                  <option value="">بدون فرع محدد</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">كلمة المرور المبدئية</label>
                <input type="password" required minLength={8} className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5">{error}</div>}
              <button type="submit" className="btn-primary w-full">حفظ المستخدم</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
