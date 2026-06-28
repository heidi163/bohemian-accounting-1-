import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Users, Receipt, DollarSign, Percent, Clock, Wallet } from "lucide-react";
import { type DashboardData } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'يناير', إيرادات: 400000, مصروفات: 240000 },
  { name: 'فبراير', إيرادات: 300000, مصروفات: 139800 },
  { name: 'مارس', إيرادات: 200000, مصروفات: 98000 },
  { name: 'أبريل', إيرادات: 278000, مصروفات: 390800 },
  { name: 'مايو', إيرادات: 189000, مصروفات: 48000 },
  { name: 'يونيو', إيرادات: 239000, مصروفات: 38000 },
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data.data))
      .catch(() => {
        // Fallback for UI mock if API fails
        setStats({ totalCash: 1250000, receivables: 450000, payables: 200000, netProfit: 150000 });
      });
  }, []);

  if (!stats) return <div className="animate-pulse p-8 shadow-sm rounded-2xl bg-white border border-slate-200">جاري التحميل...</div>;

  // New mock data for required KPIs
  const kpis = {
    revenue: 1606000,
    expenses: 944600,
    margin: 41.1, // percentage
    dso: 45, // Days Sales Outstanding
    dpo: 30, // Days Payable Outstanding
  };

  const topClients = [
    { name: 'شركة الأفق للتجارة', amount: 350000, percentage: 22 },
    { name: 'مؤسسة الرواد', amount: 280000, percentage: 17 },
    { name: 'جلوبال تيك', amount: 150000, percentage: 9 },
  ];

  const topExpenses = [
    { name: 'رواتب وأجور', amount: 450000, percentage: 47 },
    { name: 'إيجارات', amount: 120000, percentage: 12 },
    { name: 'تسويق وإعلانات', amount: 85000, percentage: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Wallet className="w-3 h-3"/> إجمالي النقد (Cash)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.totalCash)}
          </div>
          <div className="text-xs text-primary-500 font-medium mt-1">الرصيد المتاح</div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><DollarSign className="w-3 h-3"/> الإيرادات (Revenue)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.revenue)}
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1">↑ 8% عن العام الماضي</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Receipt className="w-3 h-3"/> المصروفات (Expenses)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.expenses)}
          </div>
          <div className="text-xs text-rose-500 font-medium mt-1">↑ 3% عن العام الماضي</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> صافي الربح (Net Profit)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.netProfit)}
          </div>
          <div className="text-xs text-emerald-500 font-medium mt-1">↑ 12% عن الشهر الماضي</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Percent className="w-3 h-3"/> هامش الربح (Margin %)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">{kpis.margin}%</div>
          <div className="text-xs text-emerald-500 font-medium mt-1">أعلى من المتوسط (35%)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> فترة التحصيل (DSO)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">{kpis.dso} يوم</div>
          <div className="text-xs text-rose-500 font-medium mt-1">بطيء - الهدف 30 يوم</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/> فترة السداد (DPO)</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">{kpis.dpo} يوم</div>
          <div className="text-xs text-primary-500 font-medium mt-1">ممتاز (متوافق مع الشروط)</div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><ArrowDownRight className="w-3 h-3"/> حسابات القبض</div>
          <div className="text-2xl font-bold text-slate-900" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.receivables)}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">إجمالي المبالغ للتحصيل</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[350px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">الإيرادات مقابل المصروفات (2026)</h2>
            <button onClick={() => alert('جاري تحميل التقرير...')} className="text-primary-600 text-sm font-semibold hover:underline">تحميل التقرير</button>
          </div>
          <div className="flex-1 p-6" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }} />
                <Bar dataKey="إيرادات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="مصروفات" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[350px]">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">أكبر العملاء (Top Clients)</h2>
          </div>
          <div className="flex-1 p-6 space-y-4">
             {topClients.map((client, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold"><Users className="w-4 h-4"/></div>
                      <div>
                         <p className="font-bold text-slate-800">{client.name}</p>
                         <p className="text-xs text-slate-500">{client.percentage}% من الإيرادات</p>
                      </div>
                   </div>
                   <div className="font-bold text-slate-900" dir="ltr">
                      {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(client.amount)}
                   </div>
                </div>
             ))}
          </div>
          <div className="p-6 border-y border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">أكبر المصروفات (Top Expenses)</h2>
          </div>
          <div className="flex-1 p-6 space-y-4">
             {topExpenses.map((exp, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold"><Receipt className="w-4 h-4"/></div>
                      <div>
                         <p className="font-bold text-slate-800">{exp.name}</p>
                         <p className="text-xs text-slate-500">{exp.percentage}% من المصروفات</p>
                      </div>
                   </div>
                   <div className="font-bold text-slate-900" dir="ltr">
                      {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(exp.amount)}
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
