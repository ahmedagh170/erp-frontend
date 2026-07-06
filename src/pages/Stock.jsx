import { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Clock, Boxes, X } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = [
  { key: 'balances', label: 'الأرصدة الحالية', icon: Boxes },
  { key: 'low', label: 'نقص المخزون', icon: AlertTriangle },
  { key: 'expiring', label: 'قرب انتهاء الصلاحية', icon: Clock }
];

export default function StockPage() {
  const { can } = useAuth();
  const [tab, setTab] = useState('balances');
  const [balances, setBalances] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [items, setItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [modal, setModal] = useState(null); // 'opening' | 'adjustment'
  const [form, setForm] = useState({ itemId: '', warehouseId: '', quantity: '', batchNumber: '', expiryDate: '', direction: 'IN', note: '' });
  const [error, setError] = useState('');

  async function loadAll() {
    const [b, l, e] = await Promise.all([
      apiClient.get('/stock/balances'),
      apiClient.get('/stock/low-stock'),
      apiClient.get('/stock/expiring')
    ]);
    setBalances(b.data.balances);
    setLowStock(l.data.items);
    setExpiring(e.data.batches);
  }

  useEffect(() => {
    loadAll();
    apiClient.get('/items').then(({ data }) => setItems(data.items));
    apiClient.get('/branches').then(async ({ data }) => {
      const all = [];
      for (const branch of data.branches) {
        const { data: w } = await apiClient.get(`/branches/${branch.id}/warehouses`);
        all.push(...w.warehouses.map((wh) => ({ ...wh, branchName: branch.name })));
      }
      setWarehouses(all);
    });
  }, []);

  const selectedItem = items.find((i) => i.id === form.itemId);

  async function submitOpening(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/stock/opening-balance', {
        itemId: form.itemId, warehouseId: form.warehouseId, quantity: Number(form.quantity),
        batchNumber: form.batchNumber || null, expiryDate: form.expiryDate || null, note: form.note
      });
      closeModal();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ');
    }
  }

  async function submitAdjustment(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/stock/adjustment', {
        itemId: form.itemId, warehouseId: form.warehouseId, direction: form.direction,
        quantity: Number(form.quantity), batchNumber: form.batchNumber || null, note: form.note
      });
      closeModal();
      loadAll();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ');
    }
  }

  function closeModal() {
    setModal(null);
    setError('');
    setForm({ itemId: '', warehouseId: '', quantity: '', batchNumber: '', expiryDate: '', direction: 'IN', note: '' });
  }

  return (
    <Layout title="المخزون والجرد">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.key ? 'bg-primary-600 text-white' : 'bg-white text-ink/60 border border-black/10'
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        {can('stock.adjust') && (
          <div className="flex gap-2">
            <button className="btn-secondary flex items-center gap-2" onClick={() => setModal('adjustment')}>
              تسوية مخزون
            </button>
            <button className="btn-primary flex items-center gap-2" onClick={() => setModal('opening')}>
              <Plus size={16} /> رصيد افتتاحي
            </button>
          </div>
        )}
      </div>

      {tab === 'balances' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand text-ink/60 text-xs">
              <tr>
                <th className="text-right px-5 py-3 font-medium">الصنف</th>
                <th className="text-right px-5 py-3 font-medium">المخزن</th>
                <th className="text-right px-5 py-3 font-medium">رقم التشغيلة</th>
                <th className="text-right px-5 py-3 font-medium">تاريخ الصلاحية</th>
                <th className="text-right px-5 py-3 font-medium">الكمية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {balances.map((b) => (
                <tr key={b.id} className="hover:bg-sand/50">
                  <td className="px-5 py-3 font-medium text-ink">{b.item_name} <span className="text-ink/40 text-xs">({b.sku})</span></td>
                  <td className="px-5 py-3 text-ink/60">{b.warehouse_name}</td>
                  <td className="px-5 py-3 text-ink/60">{b.batch_number || '—'}</td>
                  <td className="px-5 py-3 text-ink/60">{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString('ar-EG') : '—'}</td>
                  <td className="px-5 py-3 font-medium text-ink">{Number(b.quantity)} {b.unit_symbol}</td>
                </tr>
              ))}
              {!balances.length && <tr><td colSpan={5} className="text-center py-8 text-ink/40">لا توجد أرصدة مسجّلة بعد</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'low' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand text-ink/60 text-xs">
              <tr>
                <th className="text-right px-5 py-3 font-medium">الصنف</th>
                <th className="text-right px-5 py-3 font-medium">الرصيد الحالي</th>
                <th className="text-right px-5 py-3 font-medium">حد إعادة الطلب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {lowStock.map((i) => (
                <tr key={i.id} className="hover:bg-red-50/40">
                  <td className="px-5 py-3 font-medium text-ink">{i.name} <span className="text-ink/40 text-xs">({i.sku})</span></td>
                  <td className="px-5 py-3 text-red-600 font-medium flex items-center gap-1"><AlertTriangle size={14}/> {Number(i.total_stock)} {i.unit_symbol}</td>
                  <td className="px-5 py-3 text-ink/60">{Number(i.min_stock_level)} {i.unit_symbol}</td>
                </tr>
              ))}
              {!lowStock.length && <tr><td colSpan={3} className="text-center py-8 text-ink/40">لا توجد أصناف تحت حد إعادة الطلب 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'expiring' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand text-ink/60 text-xs">
              <tr>
                <th className="text-right px-5 py-3 font-medium">الصنف</th>
                <th className="text-right px-5 py-3 font-medium">التشغيلة</th>
                <th className="text-right px-5 py-3 font-medium">المخزن</th>
                <th className="text-right px-5 py-3 font-medium">الكمية</th>
                <th className="text-right px-5 py-3 font-medium">تاريخ الصلاحية</th>
                <th className="text-right px-5 py-3 font-medium">المدة المتبقية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {expiring.map((b, idx) => (
                <tr key={idx} className={b.days_remaining < 0 ? 'bg-red-50/40' : b.days_remaining <= 30 ? 'bg-yellow-50/40' : ''}>
                  <td className="px-5 py-3 font-medium text-ink">{b.item_name} <span className="text-ink/40 text-xs">({b.sku})</span></td>
                  <td className="px-5 py-3 text-ink/60">{b.batch_number}</td>
                  <td className="px-5 py-3 text-ink/60">{b.warehouse_name}</td>
                  <td className="px-5 py-3 text-ink/60">{Number(b.quantity)} {b.unit_symbol}</td>
                  <td className="px-5 py-3 text-ink/60">{new Date(b.expiry_date).toLocaleDateString('ar-EG')}</td>
                  <td className={`px-5 py-3 font-medium ${b.days_remaining < 0 ? 'text-red-600' : 'text-yellow-700'}`}>
                    {b.days_remaining < 0 ? `منتهية منذ ${Math.abs(b.days_remaining)} يوم` : `${b.days_remaining} يوم`}
                  </td>
                </tr>
              ))}
              {!expiring.length && <tr><td colSpan={6} className="text-center py-8 text-ink/40">لا توجد تشغيلات قاربت على الانتهاء 🎉</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{modal === 'opening' ? 'إدخال رصيد افتتاحي' : 'تسوية مخزون'}</h3>
              <button onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={modal === 'opening' ? submitOpening : submitAdjustment} className="space-y-4">
              <div>
                <label className="label">الصنف</label>
                <select required className="input-field" value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })}>
                  <option value="">اختر صنفًا</option>
                  {items.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">المخزن</label>
                <select required className="input-field" value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                  <option value="">اختر مخزنًا</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.branchName} - {w.name}</option>)}
                </select>
              </div>

              {modal === 'adjustment' && (
                <div>
                  <label className="label">الاتجاه</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm({ ...form, direction: 'IN' })}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium ${form.direction === 'IN' ? 'bg-green-600 text-white' : 'bg-sand text-ink/60'}`}>
                      زيادة
                    </button>
                    <button type="button" onClick={() => setForm({ ...form, direction: 'OUT' })}
                      className={`flex-1 rounded-xl py-2 text-sm font-medium ${form.direction === 'OUT' ? 'bg-red-600 text-white' : 'bg-sand text-ink/60'}`}>
                      نقص
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="label">الكمية {selectedItem && `(${selectedItem.base_unit_symbol})`}</label>
                <input required type="number" min="0.01" step="0.01" className="input-field" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>

              {(selectedItem?.requires_batch || modal === 'opening') && (
                <div>
                  <label className="label">رقم التشغيلة {selectedItem?.requires_batch && '(مطلوب لهذا الصنف)'}</label>
                  <input required={selectedItem?.requires_batch} className="input-field" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })} />
                </div>
              )}

              {modal === 'opening' && (
                <div>
                  <label className="label">تاريخ انتهاء الصلاحية (اختياري)</label>
                  <input type="date" className="input-field" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </div>
              )}

              <div>
                <label className="label">ملاحظة {modal === 'adjustment' && '(سبب التسوية - مطلوب)'}</label>
                <input required={modal === 'adjustment'} className="input-field" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={modal === 'adjustment' ? 'مثال: فرق جرد فعلي، تلف...' : ''} />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <button type="submit" className="btn-primary w-full">حفظ</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
