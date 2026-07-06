import { useEffect, useState } from 'react';
import { Plus, Warehouse } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

export default function BranchesPage() {
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', address: '', phone: '' });
  const [error, setError] = useState('');

  async function loadBranches() {
    const { data } = await apiClient.get('/branches');
    setBranches(data.branches);
  }

  useEffect(() => { loadBranches(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/branches', form);
      setForm({ code: '', name: '', address: '', phone: '' });
      loadBranches();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ');
    }
  }

  return (
    <Layout title="الفروع والمخازن">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={16} /> إضافة فرع جديد</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="كود الفرع (مثال: BR01)" className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              <input required placeholder="اسم الفرع" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input placeholder="العنوان" className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input placeholder="رقم الهاتف" className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <button className="btn-primary w-full">حفظ الفرع</button>
            </form>
          </div>
        </div>

        <div className="col-span-8 space-y-4">
          {branches.map((b) => (
            <div key={b.id} className="card p-5 flex items-center justify-between">
              <div>
                <div className="font-bold text-ink">{b.name} <span className="text-ink/40 text-xs font-normal">({b.code})</span></div>
                <div className="text-sm text-ink/50 mt-1">{b.address || 'بدون عنوان'} {b.phone && `— ${b.phone}`}</div>
              </div>
              <div className="flex items-center gap-2 text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full text-xs font-medium">
                <Warehouse size={14} /> {b.warehouses_count} مخزن
              </div>
            </div>
          ))}
          {!branches.length && <div className="card p-10 text-center text-ink/40">لا توجد فروع مضافة بعد</div>}
        </div>
      </div>
    </Layout>
  );
}
