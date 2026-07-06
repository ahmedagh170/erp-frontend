import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Building2, Warehouse, Package,
  Truck, Contact, Briefcase, ShoppingCart, Receipt, ArrowLeftRight,
  ClipboardList, Calculator, Landmark, FileText, BarChart3, Settings,
  Lock
} from 'lucide-react';

// كل أقسام النظام كما وردت في المتطلبات، مقسّمة لمجموعات
// isReady: true = جاهزة وتعمل الآن (المرحلة 1) / false = قادمة في مرحلة لاحقة
const SECTIONS = [
  {
    title: 'عام',
    items: [
      { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/', isReady: true },
    ]
  },
  {
    title: 'الإدارة والصلاحيات',
    items: [
      { label: 'المستخدمون', icon: Users, path: '/users', isReady: true },
      { label: 'الأدوار والصلاحيات', icon: ShieldCheck, path: '/roles', isReady: true },
      { label: 'الفروع والمخازن', icon: Building2, path: '/branches', isReady: true },
      { label: 'سجل العمليات', icon: ClipboardList, path: '/audit-log', isReady: true },
    ]
  },
  {
    title: 'الأصناف والمخزون',
    items: [
      { label: 'الأصناف', icon: Package, path: '/items', isReady: true },
      { label: 'التصنيفات', icon: Package, path: '/categories', isReady: true },
      { label: 'وحدات القياس', icon: Package, path: '/units', isReady: true },
      { label: 'المخزون والجرد', icon: Warehouse, path: '/stock', isReady: true },
      { label: 'التحويل بين المخازن', icon: ArrowLeftRight, isReady: false },
    ]
  },
  {
    title: 'العلاقات',
    items: [
      { label: 'الموردون', icon: Truck, isReady: false },
      { label: 'العملاء', icon: Contact, isReady: false },
      { label: 'المندوبون', icon: Briefcase, isReady: false },
    ]
  },
  {
    title: 'المشتريات والمبيعات',
    items: [
      { label: 'المشتريات', icon: ShoppingCart, isReady: false },
      { label: 'المبيعات والفواتير', icon: Receipt, isReady: false },
    ]
  },
  {
    title: 'الحسابات المالية',
    items: [
      { label: 'شجرة الحسابات والقيود', icon: Calculator, isReady: false },
      { label: 'الصندوق والبنك', icon: Landmark, isReady: false },
    ]
  },
  {
    title: 'التقارير',
    items: [
      { label: 'التقارير المالية والمخزنية', icon: BarChart3, isReady: false },
    ]
  },
  {
    title: 'النظام',
    items: [
      { label: 'الإعدادات', icon: Settings, isReady: false },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 bg-primary-900 text-white/90 flex flex-col overflow-y-auto">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="text-lg font-bold text-white">نظام ERP الطبي</div>
        <div className="text-xs text-white/50 mt-1">إدارة توزيع المستلزمات الطبية</div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="text-[11px] font-semibold text-white/40 px-3 mb-2 tracking-wide">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                if (!item.isReady) {
                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-white/35 cursor-not-allowed select-none"
                      title="قيد التطوير - سيتوفر في مرحلة قادمة"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={17} />
                        <span className="text-[13.5px]">{item.label}</span>
                      </div>
                      <Lock size={13} />
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white font-medium'
                          : 'hover:bg-white/5 text-white/80'
                      }`
                    }
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
