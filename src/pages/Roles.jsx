import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedPerms, setCheckedPerms] = useState(new Set());
  const [newRoleName, setNewRoleName] = useState('');
  const [message, setMessage] = useState('');

  async function loadRoles() {
    const { data } = await apiClient.get('/roles');
    setRoles(data.roles);
  }

  useEffect(() => {
    loadRoles();
    apiClient.get('/roles/permissions-catalog').then(({ data }) => setCatalog(data.permissions));
  }, []);

  async function selectRole(role) {
    setSelectedRole(role);
    setMessage('');
    const { data } = await apiClient.get(`/roles/${role.id}/permissions`);
    setCheckedPerms(new Set(data.permissionIds));
  }

  function togglePerm(id) {
    setCheckedPerms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function savePermissions() {
    await apiClient.put(`/roles/${selectedRole.id}/permissions`, { permissionIds: [...checkedPerms] });
    setMessage('تم حفظ الصلاحيات بنجاح ✓');
    setTimeout(() => setMessage(''), 3000);
  }

  async function createRole(e) {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    await apiClient.post('/roles', { name: newRoleName });
    setNewRoleName('');
    loadRoles();
  }

  async function deleteRole(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الدور؟')) return;
    try {
      await apiClient.delete(`/roles/${id}`);
      if (selectedRole?.id === id) setSelectedRole(null);
      loadRoles();
    } catch (err) {
      alert(err.response?.data?.error || 'تعذّر حذف الدور');
    }
  }

  const grouped = catalog.reduce((acc, p) => {
    acc[p.module] = acc[p.module] || [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <Layout title="الأدوار والصلاحيات">
      <div className="grid grid-cols-12 gap-6">
        {/* قائمة الأدوار */}
        <div className="col-span-4">
          <div className="card p-4 mb-4">
            <form onSubmit={createRole} className="flex gap-2">
              <input
                className="input-field"
                placeholder="اسم دور جديد..."
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button className="btn-primary shrink-0"><Plus size={16} /></button>
            </form>
          </div>
          <div className="card divide-y divide-black/5">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => selectRole(r)}
                className={`w-full text-right px-5 py-3.5 flex items-center justify-between transition-colors ${
                  selectedRole?.id === r.id ? 'bg-primary-50' : 'hover:bg-sand/60'
                }`}
              >
                <div>
                  <div className="font-medium text-ink text-sm">{r.name}</div>
                  <div className="text-xs text-ink/40 mt-0.5">{r.users_count} مستخدم</div>
                </div>
                {!r.is_system && (
                  <span onClick={(e) => { e.stopPropagation(); deleteRole(r.id); }} className="text-ink/30 hover:text-red-500">
                    <Trash2 size={15} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* لوحة الصلاحيات */}
        <div className="col-span-8">
          {!selectedRole ? (
            <div className="card p-10 text-center text-ink/40 text-sm">
              اختر دورًا من القائمة لعرض وتعديل صلاحياته
            </div>
          ) : (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg text-ink">صلاحيات: {selectedRole.name}</h3>
                <button onClick={savePermissions} className="btn-primary flex items-center gap-2">
                  <Save size={15} /> حفظ الصلاحيات
                </button>
              </div>

              {message && <div className="mb-4 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2">{message}</div>}

              <div className="space-y-5">
                {Object.entries(grouped).map(([module, perms]) => (
                  <div key={module}>
                    <div className="text-xs font-semibold text-ink/40 mb-2 uppercase">{module}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((p) => (
                        <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            className="accent-primary-600 w-4 h-4"
                            checked={checkedPerms.has(p.id)}
                            onChange={() => togglePerm(p.id)}
                            disabled={selectedRole.is_system}
                          />
                          {p.label_ar}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {selectedRole.is_system && (
                <p className="text-xs text-ink/40 mt-5">هذا دور نظامي (مدير عام) يملك كل الصلاحيات دائمًا ولا يمكن تعديله.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
