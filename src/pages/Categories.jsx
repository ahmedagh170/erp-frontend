import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/categories');
    setCategories(data.categories);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/categories', { name, parentId: parentId || null });
      setName(''); setParentId('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ');
    }
  }

  async function handleDelete(id) {
    if (!confirm('حذف هذا التصنيف؟')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'تعذّر الحذف');
    }
  }

  return (
    <Layout title="التصنيفات">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={16} /> إضافة تصنيف</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="اسم التصنيف" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              <select className="input-field" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">تصنيف رئيسي (بدون أب)</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <button className="btn-primary w-full">حفظ</button>
            </form>
          </div>
        </div>
        <div className="col-span-8">
          <div className="card divide-y divide-black/5">
            {categories.map((c) => (
              <div key={c.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-ink text-sm">
                    {c.parent_name && <span className="text-ink/40">{c.parent_name} ← </span>}
                    {c.name}
                  </div>
                  <div className="text-xs text-ink/40 mt-0.5">{c.items_count} صنف</div>
                </div>
                <button onClick={() => handleDelete(c.id)} className="text-ink/30 hover:text-red-500">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {!categories.length && <div className="p-8 text-center text-ink/40">لا توجد تصنيفات بعد</div>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
