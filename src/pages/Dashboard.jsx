import { useEffect, useState } from 'react';
import { Users, Building2, Warehouse, Activity } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

const ACTION_LABELS = {
  LOGIN: 'تسجيل دخول',
  LOGIN_FAILED: 'محاولة دخول فاشلة',
  CREATE: 'إنشاء',
  UPDATE: 'تعديل',
  DELETE: 'حذف',
  ACTIVATE: 'تفعيل',
  DEACTIVATE: 'تعطيل'
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    apiClient.get('/dashboard/summary').then(({ data }) => setSummary(data));
  }, []);

  const stats = [
    { label: 'المستخدمون النشطون', value: summary?.activeUsers, icon: Users },
    { label: 'الفروع النشطة', value: summary?.activeBranches, icon: Building2 },
    { label: 'المخازن النشطة', value: summary?.activeWarehouses, icon: Warehouse }
  ];

  return (
    <Layout title="لوحة التحكم">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card p-6 flex items-center justify-between">
            <div>
              <div className="text-sm text-ink/50 mb-1">{s.label}</div>
              <div className="text-3xl font-bold text-ink">{s.value ?? '—'}</div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center">
              <s.icon size={22} className="text-primary-600" />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={18} className="text-primary-600" />
          <h2 className="font-bold text-ink">آخر العمليات في النظام</h2>
        </div>
        <div className="divide-y divide-black/5">
          {summary?.recentActivity?.length ? (
            summary.recentActivity.map((log, i) => (
              <div key={i} className="py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-ink">{log.username_snapshot || 'النظام'}</span>
                  <span className="text-ink/50"> — {ACTION_LABELS[log.action] || log.action} — {log.entity_type}</span>
                </div>
                <span className="text-ink/40 text-xs">
                  {new Date(log.created_at).toLocaleString('ar-EG')}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-ink/40 text-sm">لا توجد عمليات مسجّلة بعد</div>
          )}
        </div>
      </div>

      <div className="mt-8 card p-6 border-dashed border-2 border-primary-200 bg-primary-50/30">
        <p className="text-sm text-ink/60 leading-relaxed">
          هذه المرحلة الأولى من النظام (الأساسيات والصلاحيات). الوحدات التالية —
          الأصناف والمخزون، المشتريات، المبيعات، الحسابات، والتقارير — ستُبنى
          في المراحل القادمة وستظهر هنا تلقائيًا فور جاهزيتها.
        </p>
      </div>
    </Layout>
  );
}
