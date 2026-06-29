import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Users, Receipt, DollarSign, Percent, Clock, Wallet } from "lucide-react";
import { type DashboardData } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getActiveCompany } from "../utils/storage";

const data = [
  { name: 'يناير', إيرادات: 400000, مصروفات: 240000 },
  { name: 'فبراير', إيرادات: 300000, مصروفات: 139800 },
  { name: 'مارس', إيرادات: 200000, مصروفات: 98000 },
  { name: 'أبريل', إيرادات: 278000, مصروفات: 390800 },
  { name: 'مايو', إيرادات: 189000, مصروفات: 48000 },
  { name: 'يونيو', إيرادات: 239000, مصروفات: 38000 },
  { name: 'يوليو', إيرادات: 349000, مصروفات: 143000 },
  { name: 'أغسطس', إيرادات: 200000, مصروفات: 98000 },
];

const COLORS = [
  'var(--color-primary-500)', 
  'var(--color-primary-300)', 
  'var(--color-primary-700)', 
  'var(--color-primary-400)', 
  'var(--color-primary-600)'
];

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data.data))
      .catch(() => {
        const company = getActiveCompany();
        if (company === "BGK") {
          setStats({ totalCash: 1250000, receivables: 450000, payables: 200000, netProfit: 150000 });
        } else {
          setStats({ totalCash: 350000, receivables: 120000, payables: 60000, netProfit: 45000 });
        }
      });
  }, []);

  if (!stats) return <div className="animate-pulse p-8 shadow-sm rounded-3xl bg-white border border-slate-100">جاري التحميل...</div>;

  const company = getActiveCompany();
  const kpis = company === "BGK" ? {
    revenue: 1606000,
    expenses: 944600,
    margin: 41.1,
    dso: 45,
    dpo: 30,
  } : {
    revenue: 600000,
    expenses: 250000,
    margin: 58.3,
    dso: 20,
    dpo: 45,
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

  const pieData = topExpenses.map(exp => ({ name: exp.name, value: exp.amount }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>إجمالي النقد</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Wallet className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.totalCash)}
            </div>
            <div className="text-sm text-emerald-500 font-medium mt-1">الرصيد المتاح حالياً</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>الإيرادات</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><DollarSign className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.revenue)}
            </div>
            <div className="text-sm text-emerald-500 font-medium mt-1">↑ 8.2% عن العام الماضي</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>المصروفات</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><Receipt className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.expenses)}
            </div>
            <div className="text-sm text-rose-500 font-medium mt-1">↑ 3.4% عن العام الماضي</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>صافي الربح</span>
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><ArrowUpRight className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.netProfit)}
            </div>
            <div className="text-sm text-emerald-500 font-medium mt-1">↑ 12% عن الشهر الماضي</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col min-h-[400px]">
          <div className="p-6 md:p-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">حركة المبيعات (Sales dynamics)</h2>
            <select className="bg-slate-50 border-0 text-sm font-medium rounded-full px-4 py-1.5 text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <div className="flex-1 px-4 md:px-8 pb-6" style={{ direction: 'ltr' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} dy={10} />
                <Tooltip cursor={{ fill: '#f8fafc', radius: 12 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="إيرادات" fill="var(--color-primary-500)" radius={[12, 12, 12, 12]} background={{ fill: 'var(--color-primary-50)', radius: [12, 12, 12, 12] }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col">
          <div className="p-6 pb-2 border-b border-slate-50 flex flex-col">
             <h2 className="text-lg font-bold text-slate-900 tracking-tight">هيكل المصروفات</h2>
             <p className="text-sm text-slate-500 mt-1">توزيع أكبر المصروفات للعام الحالي</p>
          </div>
          <div className="flex-1 p-6 flex flex-col justify-center items-center" style={{ direction: 'ltr' }}>
             <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                   <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                   >
                      {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 15px rgb(0 0 0 / 0.05)', textAlign: 'right' }}
                     itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                     formatter={(value: number) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(value)}
                   />
                </PieChart>
             </ResponsiveContainer>
             <div className="w-full mt-4 space-y-3" dir="rtl">
                {topExpenses.map((exp, idx) => (
                   <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                         <span className="font-medium text-slate-700">{exp.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{exp.percentage}%</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
        
        <div className="lg:col-span-12 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 md:p-8 overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">طلبات العملاء (Customer orders)</h2>
          </div>
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-50">
                <th className="pb-4 font-medium px-2">العميل</th>
                <th className="pb-4 font-medium px-2">التاريخ</th>
                <th className="pb-4 font-medium px-2">الحالة</th>
                <th className="pb-4 font-medium px-2">القيمة</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((client, idx) => (
                <tr key={idx} className="border-b border-slate-50/50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                         {client.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-800">{client.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-slate-500 font-medium">22.08.2026</td>
                  <td className="py-4 px-2">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold">مكتمل</span>
                  </td>
                  <td className="py-4 px-2 font-bold text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(client.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
