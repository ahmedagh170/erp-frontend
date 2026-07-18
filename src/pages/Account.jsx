import { useState } from 'react';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout.jsx';
import apiClient from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      setSuccess('تم تغيير كلمة المرور بنجاح ✓');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="حسابي الشخصي">
      <div className="max-w-lg">
        <div className="card p-6 mb-6">
          <div className="text-sm text-ink/50 mb-1">الاسم الكامل</div>
          <div className="font-bold text-ink mb-4">{user?.full_name}</div>
          <div className="text-sm text-ink/50 mb-1">اسم المستخدم</div>
          <div className="font-bold text-ink mb-4">{user?.username}</div>
          <div className="text-sm text-ink/50 mb-1">الدور</div>
          <div className="font-bold text-ink">{user?.role_name}</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound size={18} className="text-primary-600" />
            <h2 className="font-bold text-ink">تغيير كلمة المرور</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">كلمة المرور الحالية</label>
              <input
                type="password"
                required
                className="input-field"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="label">كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8 أحرف على الأقل"
              />
            </div>
            <div>
              <label className="label">تأكيد كلمة المرور الجديدة</label>
              <input
                type="password"
                required
                minLength={8}
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <CheckCircle2 size={15} /> {success}
              </div>
            )}

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              حفظ كلمة المرور الجديدة
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
