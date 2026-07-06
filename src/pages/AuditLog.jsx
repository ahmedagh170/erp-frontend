import { useEffect, useState } from 'react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';

const ACTION_LABELS = {
  LOGIN: 'تسجيل دخول', LOGIN_FAILED: 'محاولة دخول فاشلة',
  CREATE: 'إنشاء', UPDATE: 'تعديل', DELETE: 'حذف',
  ACTIVATE: 'تفعيل', DEACTIVATE: 'تعطيل'
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    apiClient.get('/audit-log', { params: { page, pageSize } }).then(({ data }) => {
      setLogs(data.logs);
      setTotal(data.total);
    });
  }, [page]);

  return (
    <Layout title="سجل العمليات (Audit Log)">
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-sand text-ink/60 text-xs">
            <tr>
              <th className="text-right px-5 py-3 font-medium">التاريخ والوقت</th>
              <th className="text-right px-5 py-3 font-medium">المستخدم</th>
              <th className="text-right px-5 py-3 font-medium">العملية</th>
              <th className="text-right px-5 py-3 font-medium">القسم</th>
              <th className="text-right px-5 py-3 font-medium">عنوان IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-sand/50">
                <td className="px-5 py-3 text-ink/60 text-xs">{new Date(log.created_at).toLocaleString('ar-EG')}</td>
                <td className="px-5 py-3 font-medium text-ink">{log.username_snapshot || 'النظام'}</td>
                <td className="px-5 py-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink/60">{log.entity_type}</td>
                <td className="px-5 py-3 text-ink/40 text-xs">{log.ip_address || '—'}</td>
              </tr>
            ))}
            {!logs.length && <tr><td colSpan={5} className="text-center py-8 text-ink/40">لا توجد عمليات مسجّلة</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-ink/50">
        <span>إجمالي السجلات: {total}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="btn-secondary disabled:opacity-40">السابق</button>
          <button disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:opacity-40">التالي</button>
        </div>
      </div>
    </Layout>
  );
}
