import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, ArrowDownRight, Users, Receipt, DollarSign, Percent, Clock, Wallet, Plus, FileText, Landmark, AlertCircle, Building2, TrendingDown, TrendingUp } from "lucide-react";
import { type DashboardData } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getActiveCompany } from "../utils/storage";
import apiClient from "../api/client";

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const company = getActiveCompany();

  useEffect(() => {
    const companyId = company === "BGK" ? 1 : 2;

    apiClient.get(`/dashboard/metrics?company_id=${companyId}`)
      .then((res) => {
        const m = (res.data.data && res.data.data.metrics) || null;
        setStats({ 
          totalCash: m.net_profit + 500000, // Temp mock for cash
          receivables: m.pending_invoices_amount + m.overdue_invoices_amount, 
          payables: m.total_expenses * 0.2, // Temp mock for payables
          netProfit: m.net_profit,
          revenue: m.total_revenue,
          expenses: m.total_expenses
        });
      })
      .catch(() => {
        // Fallback if API is unreachable
        if (company === "BGK") {
          setStats({ totalCash: 1250000, receivables: 450000, payables: 200000, netProfit: 150000, revenue: 1606000, expenses: 944600 });
        } else {
          setStats({ totalCash: 350000, receivables: 120000, payables: 60000, netProfit: 45000, revenue: 600000, expenses: 250000 });
        }
      });
  }, []);

  if (!stats) return <div className="animate-pulse p-8 shadow-sm rounded-3xl bg-white border border-slate-100">جاري التحميل...</div>;

  const kpis = {
    revenue: stats.revenue || 0,
    expenses: stats.expenses || 0,
    margin: stats.revenue ? ((stats.netProfit / stats.revenue) * 100) : 0,
    dso: company === "BGK" ? 45 : 20,
    dpo: company === "BGK" ? 30 : 45,
  };

  const topExpenses = [
    { name: 'رواتب وأجور', amount: 450000, percentage: 47 },
    { name: 'إيجارات', amount: 120000, percentage: 12 },
    { name: 'تسويق وإعلانات', amount: 85000, percentage: 9 },
  ];

  const pieData = topExpenses.map(exp => ({ name: exp.name, value: exp.amount }));

  // Top Debtors Mock Data
  const topDebtors = [
    { id: 'C-089', client: 'شركة الأفق للتجارة', amount: 350000, daysOverdue: 45, status: 'شديدة التأخير' },
    { id: 'C-042', client: 'مؤسسة الرواد', amount: 120000, daysOverdue: 15, status: 'متأخرة' },
    { id: 'C-105', client: 'المتحدة للبرمجيات', amount: 85000, daysOverdue: 5, status: 'تنبيه' },
  ];

  const bankBalances = [
    { id: 1, bank: 'البنك الأهلي المصري', account: '...4567', balance: 850000 },
    { id: 2, bank: 'بنك مصر (دولار)', account: '...8901', balance: 350000 },
    { id: 3, bank: 'الخزينة الرئيسية', account: 'نقدي', balance: 50000 },
  ];

  const upcomingChecks = [
    { id: 1, to: 'شركة الأفق', date: 'غداً', amount: 45000, type: 'صادر' },
    { id: 2, to: 'مؤسسة الرواد', date: 'خلال 3 أيام', amount: 120000, type: 'وارد' },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'شديدة التأخير': return 'bg-rose-50 text-rose-700 border border-rose-100';
      case 'متأخرة': return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'تنبيه': return 'bg-slate-100 text-slate-700 border border-slate-200';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => navigate('/invoices/new')} className="bg-primary text-white px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <Plus className="w-4 h-4" /> فاتورة جديدة
        </button>
        <button onClick={() => navigate('/purchases/new')} className="bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <Receipt className="w-4 h-4" /> تسجيل مصروف
        </button>
        <button onClick={() => navigate('/journal/new')} className="bg-white text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
          <FileText className="w-4 h-4" /> قيد يومية
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>إجمالي النقد</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Wallet className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.totalCash)}
            </div>
            <div className="text-sm text-primary-500 font-medium mt-1 flex items-center gap-1">الرصيد المتاح حالياً</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>الإيرادات</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><DollarSign className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.revenue)}
            </div>
            <div className="text-sm text-primary-500 font-medium mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 8.2% عن العام الماضي</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>المصروفات</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors"><Receipt className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(kpis.expenses)}
            </div>
            <div className="text-sm text-rose-500 font-medium mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 3.4% عن العام الماضي</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-semibold text-slate-500 mb-2 flex justify-between items-center">
            <span>صافي الربح</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Percent className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.netProfit)}
            </div>
            <div className="text-sm text-primary-500 font-medium mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3"/> 12% عن الشهر الماضي</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col min-h-[400px]">
          <div className="p-6 md:p-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">حركة المبيعات والتدفقات</h2>
            <select className="bg-slate-50 border-0 text-sm font-medium rounded-full px-4 py-1.5 text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 transition-all hover:bg-slate-100">
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

        {/* Expenses Doughnut */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col">
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
                   <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                         <span className="font-semibold text-slate-700">{exp.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">{exp.percentage}%</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
        
        {/* Bottom Section: Receivables, Payables & Top Debtors */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* AR / AP Summary Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div>
                   <p className="text-sm font-bold text-slate-500 mb-2">لنا عند العملاء (ذمم مدينة)</p>
                   <h3 className="text-2xl font-bold text-slate-900" dir="ltr">
                     {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.receivables)}
                   </h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center"><TrendingUp className="w-7 h-7"/></div>
             </div>
             <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div>
                   <p className="text-sm font-bold text-slate-500 mb-2">علينا للموردين (ذمم دائنة)</p>
                   <h3 className="text-2xl font-bold text-slate-900" dir="ltr">
                     {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(stats.payables)}
                   </h3>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center"><TrendingDown className="w-7 h-7"/></div>
             </div>
          </div>

          {/* Top Debtors Table */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col flex-1">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">أهم المديونيات المتأخرة</h2>
                <p className="text-sm text-slate-500 mt-1">العملاء ذوي أكبر مبالغ غير مسددة ويجب متابعتهم</p>
              </div>
              <button className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-colors">إدارة التحصيل</button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6 font-bold text-start">العميل / المعرف</th>
                    <th className="py-4 px-6 font-bold">أيام التأخير</th>
                    <th className="py-4 px-6 font-bold">المبلغ المستحق</th>
                    <th className="py-4 px-6 font-bold text-end">حالة المتابعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {topDebtors.map((debtor, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{debtor.client}</span>
                          <span className="text-xs font-semibold text-slate-500 mt-0.5">{debtor.id}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-rose-600">{debtor.daysOverdue} يوم</span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900" dir="ltr">
                        {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(debtor.amount)}
                      </td>
                      <td className="py-4 px-6 text-end">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-block ${getStatusStyle(debtor.status)}`}>
                          {debtor.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Section: Banks & Checks */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Bank Balances */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Landmark className="w-5 h-5 text-slate-400" /> البنوك والخزائن
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {bankBalances.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{bank.bank}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{bank.account}</p>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(bank.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Checks */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col">
            <div className="p-6 pb-4 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> شيكات مستحقة قريباً
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {upcomingChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/30 border border-amber-100/50 cursor-pointer hover:bg-amber-100/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{check.to}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${check.type === 'صادر' ? 'bg-rose-100 text-rose-700' : 'bg-primary-100 text-primary-700'}`}>
                        {check.type}
                      </span>
                      <span className="text-xs text-amber-600 font-bold">{check.date}</span>
                    </div>
                  </div>
                  <div className="font-bold text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(check.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
