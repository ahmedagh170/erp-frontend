import { useEffect, useState } from 'react';
import { Plus, Search, Power, X, Barcode, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = {
  sku: '', barcode: '', name: '', categoryId: '', baseUnitId: '', purchaseUnitId: '',
  purchaseUnitFactor: 1, costPrice: 0, salePrice: 0, taxRate: 0, minStockLevel: 0, requiresBatch: true
};

export default function ItemsPage() {
  const { can } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  async function loadItems() {
    const { data } = await apiClient.get('/items', { params: { search } });
    setItems(data.items);
  }

  useEffect(() => {
    loadItems();
    apiClient.get('/categories').then(({ data }) => setCategories(data.categories));
    apiClient.get('/units').then(({ data }) => setUnits(data.units));
  }, []);

  useEffect(() => {
    const t = setTimeout(loadItems, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/items', {
        ...form,
        purchaseUnitFactor: Number(form.purchaseUnitFactor),
        costPrice: Number(form.costPrice),
        salePrice: Number(form.salePrice),
        taxRate: Number(form.taxRate),
        minStockLevel: Number(form.minStockLevel),
        categoryId: form.categoryId || null,
        purchaseUnitId: form.purchaseUnitId || null,
        barcode: form.barcode || ''
      });
      setShowModal(false);
      setForm(emptyForm);
      loadItems();
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء إضافة الصنف');
    }
  }

  async function toggleActive(id) {
    await apiClient.patch(`/items/${id}/toggle-active`);
    loadItems();
  }

  return (
    <Layout title="الأصناف">
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-80">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input className="input-field pr-10" placeholder="ابحث بالاسم أو الكود أو الباركود..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {can('items.create') && (
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowModal(true)}>
            <Plus size={16} /> إضافة صنف
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink/60 text-xs">
            <tr>
              <th className="text-right px-5 py-3 font-medium">الصنف</th>
              <th className="text-right px-5 py-3 font-medium">الكود</th>
              <th className="text-right px-5 py-3 font-medium">الباركود</th>
              <th className="text-right px-5 py-3 font-medium">التصنيف</th>
              <th className="text-right px-5 py-3 font-medium">سعر البيع</th>
              <th className="text-right px-5 py-3 font-medium">الرصيد الكلي</th>
              <th className="text-right px-5 py-3 font-medium">الحالة</th>
              {can('items.delete') && <th className="px-5 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-sand/50">
                <td className="px-5 py-3 font-medium text-ink">
                  {i.name}
                  {i.requires_batch && <span className="mr-2 text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full">تشغيلة</span>}
                </td>
                <td className="px-5 py-3 text-ink/60">{i.sku}</td>
                <td className="px-5 py-3 text-ink/60">
                  {i.barcode ? <span className="flex items-center gap-1"><Barcode size={13}/> {i.barcode}</span> : '—'}
                </td>
                <td className="px-5 py-3 text-ink/60">{i.category_name || '—'}</td>
                <td className="px-5 py-3 text-ink/60">{Number(i.sale_price).toLocaleString('ar-EG')} ج.م</td>
                <td className="px-5 py-3">
                  <span className={Number(i.total_stock) <= i.min_stock_level && i.min_stock_level > 0 ? 'text-red-600 font-medium flex items-center gap-1' : 'text-ink/60'}>
                    {Number(i.total_stock) <= i.min_stock_level && i.min_stock_level > 0 && <AlertTriangle size={13} />}
                    {Number(i.total_stock)} {i.base_unit_symbol}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${i.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {i.is_active ? 'نشط' : 'معطّل'}
                  </span>
                </td>
                {can('items.delete') && (
                  <td className="px-5 py-3">
                    <button onClick={() => toggleActive(i.id)} className="text-ink/40 hover:text-primary-600"><Power size={16} /></button>
                  </td>
                )}
              </tr>
            ))}
            {!items.length && <tr><td colSpan={8} className="text-center py-8 text-ink/40">لا توجد أصناف مطابقة</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">إضافة صنف جديد</h3>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">اسم الصنف</label>
                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">كود الصنف (SKU)</label>
                <input required className="input-field" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              </div>
              <div>
                <label className="label">الباركود (اختياري)</label>
                <input className="input-field" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
              </div>
              <div>
                <label className="label">التصنيف</label>
                <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">بدون تصنيف</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">الوحدة الأساسية</label>
                <select required className="input-field" value={form.baseUnitId} onChange={(e) => setForm({ ...form, baseUnitId: e.target.value })}>
                  <option value="">اختر وحدة</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">وحدة الشراء (اختياري)</label>
                <select className="input-field" value={form.purchaseUnitId} onChange={(e) => setForm({ ...form, purchaseUnitId: e.target.value })}>
                  <option value="">نفس الوحدة الأساسية</option>
                  {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">معامل التحويل (كم وحدة أساسية في وحدة الشراء)</label>
                <input type="number" min="1" step="0.01" className="input-field" value={form.purchaseUnitFactor} onChange={(e) => setForm({ ...form, purchaseUnitFactor: e.target.value })} />
              </div>
              <div>
                <label className="label">سعر التكلفة</label>
                <input type="number" min="0" step="0.01" className="input-field" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
              </div>
              <div>
                <label className="label">سعر البيع</label>
                <input type="number" min="0" step="0.01" className="input-field" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
              </div>
              <div>
                <label className="label">نسبة الضريبة %</label>
                <input type="number" min="0" max="100" step="0.01" className="input-field" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: e.target.value })} />
              </div>
              <div>
                <label className="label">حد إعادة الطلب (تنبيه نقص المخزون)</label>
                <input type="number" min="0" step="0.01" className="input-field" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} />
              </div>
              <div className="col-span-2 flex items-center gap-2.5">
                <input type="checkbox" className="accent-primary-600 w-4 h-4" checked={form.requiresBatch} onChange={(e) => setForm({ ...form, requiresBatch: e.target.checked })} />
                <label className="text-sm text-ink/70">يتطلب رقم تشغيلة (Batch) وتاريخ صلاحية — موصى به لكل المستلزمات الطبية</label>
              </div>
              {error && <div className="col-span-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</div>}
              <button type="submit" className="btn-primary col-span-2">حفظ الصنف</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
