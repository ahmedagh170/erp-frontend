import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

export default function UnitsPage() {
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ name: '', symbol: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/units');
    setUnits(data.units);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/units', form);
      setForm({ name: '', symbol: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ');
    }
  }

  async function handleDelete(id) {
    if (!confirm('حذف هذه الوحدة؟')) return;
    try {
      await apiClient.delete(`/units/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'تعذّر الحذف');
    }
  }

  return (
    <Layout title="وحدات القياس">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={16} /> إضافة وحدة</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="اسم الوحدة (مثال: كرتونة)" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required placeholder="الرمز المختصر (مثال: كرتونة)" className="input-field" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} />
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <button className="btn-primary w-full">حفظ</button>
            </form>
          </div>
        </div>
        <div className="col-span-8">
          <div className="card divide-y divide-black/5">
            {units.map((u) => (
              <div key={u.id} className="px-5 py-3.5 flex items-center justify-between">
                <span className="font-medium text-ink text-sm">{u.name} <span className="text-ink/40">({u.symbol})</span></span>
                <button onClick={() => handleDelete(u.id)} className="text-ink/30 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
