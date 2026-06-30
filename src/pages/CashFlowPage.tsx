import { useEffect, useState, useMemo } from "react";
import { type CashForecast, type CrisisAlert, type Recommendation, type ScenarioType } from "../types";
import { clsx } from "clsx";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight,
  CheckCircle, Wallet, TrendingUp, TrendingDown, Shield, Sun, Cloud, CloudRain
} from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(n);
const fmtShort = (n: number) => new Intl.NumberFormat('ar-EG').format(n);

export function CashFlowPage() {
  const [scenario, setScenario] = useState<ScenarioType>('realistic');
  const [forecast, setForecast] = useState<CashForecast[]>([]);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const fetchForecastData = async () => {
    try {
      const [forecastRes, insightsRes] = await Promise.all([
        fetch(`/api/cash-flow/forecast?scenario=${scenario}`),
        fetch("/api/cash-flow/insights")
      ]);
      if (!forecastRes.ok || !insightsRes.ok) throw new Error('API Error');
      const forecastData = await forecastRes.json();
      const insightsData = await insightsRes.json();
      setForecast(forecastData.data);
      setAlerts(insightsData.alerts);
      setRecommendations(insightsData.recommendations);
    } catch {
      const inflows = {
        optimistic:  [600000, 400000, 200000, 500000, 350000, 250000, 700000, 300000, 450000, 200000, 600000, 350000],
        realistic:   [500000, 300000, 100000, 400000, 250000, 150000, 550000, 200000, 350000, 150000, 500000, 250000],
        pessimistic: [400000, 200000,       0, 300000, 150000,  50000, 400000, 100000, 250000,  50000, 400000, 150000],
      };
      const outflows = [200000, 400000, 1600000, 300000, 200000, 350000, 400000, 250000, 300000, 200000, 450000, 300000];

      let balance = 1500000;
      const rows: CashForecast[] = inflows[scenario].map((inf, i) => {
        const start = balance;
        const end = start + inf - outflows[i];
        balance = end;
        return { period: `الأسبوع ${i + 1}`, starting_balance: start, inflows: inf, outflows: outflows[i], ending_balance: end };
      });
      setForecast(rows);

      const hasNegative = rows.some(r => r.ending_balance < 0);
      setAlerts(hasNegative && scenario !== 'optimistic' ? [
        { status: "critical", triggered_period: rows.find(r => r.ending_balance < 0)?.period ?? "الأسبوع 3", message: "عجز نقدي متوقع بسبب مدفوعات الموردين وجدولة الرواتب." }
      ] as any[] : []);

      setRecommendations([
        { id: "1", type: "collection", action: "تسريع تحصيل فاتورة شركة الأمل", impact_amount: 150000 },
        { id: "2", type: "payment",    action: "تأجيل سداد دفعة مكتب جرير للأسبوع الرابع", impact_amount: 80000 }
      ] as any[]);
    }
  };

  useEffect(() => { fetchForecastData(); }, [scenario]);

  // ─── Derived Metrics ───────────────────────────────────────────────
  const currentBalance = forecast[0]?.starting_balance ?? 0;
  const totalInflows30  = forecast.slice(0, 4).reduce((s, r) => s + r.inflows,  0);
  const totalOutflows30 = forecast.slice(0, 4).reduce((s, r) => s + r.outflows, 0);
  const avgWeeklyBurn   = forecast.length ? forecast.reduce((s, r) => s + r.outflows - r.inflows, 0) / forecast.length : 0;
  const runway = avgWeeklyBurn > 0 ? Math.floor(currentBalance / avgWeeklyBurn) : 99;

  const chartHasNegative = forecast.some(r => r.ending_balance < 0);
  const chartColor = chartHasNegative ? '#f43f5e' : 'var(--color-primary-500, #16a34a)';
  const chartGradId = chartHasNegative ? 'gradRed' : 'gradGreen';

  const scenarios: { key: ScenarioType; label: string; icon: React.ReactNode }[] = [
    { key: 'pessimistic', label: 'متشائم', icon: <CloudRain className="w-4 h-4" /> },
    { key: 'realistic',   label: 'واقعي',   icon: <Cloud     className="w-4 h-4" /> },
    { key: 'optimistic',  label: 'متفائل',  icon: <Sun       className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl tracking-tight">توقعات التدفق النقدي</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">تحليل مسار السيولة المستقبلية ومحاكاة السيناريوهات المختلفة.</p>
        </div>
        {/* Scenario Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
          {scenarios.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200",
                scenario === key
                  ? key === 'optimistic'  ? "bg-emerald-500 text-white shadow"
                  : key === 'pessimistic' ? "bg-rose-500 text-white shadow"
                  : "bg-white text-primary-700 shadow"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Top Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "الرصيد النقدي الحالي",
            value: fmt(currentBalance),
            icon: <Wallet className="w-5 h-5" />,
            bg: "bg-primary-50", iconColor: "text-primary-600",
            sub: "السيولة المتاحة الآن"
          },
          {
            label: "مقبوضات متوقعة (30 يوم)",
            value: fmt(totalInflows30),
            icon: <TrendingUp className="w-5 h-5" />,
            bg: "bg-emerald-50", iconColor: "text-emerald-600",
            sub: "إجمالي الإيرادات المرتقبة"
          },
          {
            label: "مدفوعات مستحقة (30 يوم)",
            value: fmt(totalOutflows30),
            icon: <TrendingDown className="w-5 h-5" />,
            bg: "bg-rose-50", iconColor: "text-rose-600",
            sub: "إجمالي الالتزامات المستحقة"
          },
          {
            label: "مؤشر الأمان النقدي",
            value: runway > 50 ? "آمن جداً ✓" : `${runway} أسبوع`,
            icon: <Shield className="w-5 h-5" />,
            bg: runway > 8 ? "bg-emerald-50" : "bg-amber-50",
            iconColor: runway > 8 ? "text-emerald-600" : "text-amber-600",
            sub: "مدة الصمود بالرصيد الحالي"
          },
        ].map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 hover:-translate-y-1 transition-transform duration-300 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <span className="text-sm font-bold text-slate-500">{card.label}</span>
              <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0", card.bg, card.iconColor)}>
                {card.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight leading-tight" dir="ltr">{card.value}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Chart + Table */}
        <div className="lg:col-span-2 space-y-6">

          {/* Area Chart */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-6">مسار السيولة النقدية</h3>
            <div className="h-52" style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.map(r => ({ name: r.period, رصيد: r.ending_balance }))}
                  margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--color-primary-500, #16a34a)" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="var(--color-primary-500, #16a34a)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => new Intl.NumberFormat('en', { notation: 'compact' }).format(v)}
                    tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                  <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" strokeWidth={1.5} />
                  <Tooltip
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.12)', textAlign: 'right', direction: 'rtl' }}
                    formatter={(v: number) => [fmtShort(v) + ' ج.م', 'رصيد نهاية الفترة']}
                  />
                  <Area type="monotone" dataKey="رصيد" stroke={chartColor} strokeWidth={2.5}
                    fill={`url(#${chartGradId})`} dot={{ r: 3, fill: chartColor, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: chartColor }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {chartHasNegative && (
              <div className="mt-4 flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                الخط الأحمر يشير إلى عجز نقدي متوقع — يُنصح باتخاذ إجراء فوري.
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">تفاصيل التوقعات الأسبوعية</h3>
              <span className="text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg">12 أسبوع</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 text-slate-400 text-xs font-black uppercase tracking-wider">
                    <th className="px-5 py-3 text-start">الفترة</th>
                    <th className="px-5 py-3 text-end">رصيد البداية</th>
                    <th className="px-5 py-3 text-end">المقبوضات</th>
                    <th className="px-5 py-3 text-end">المدفوعات</th>
                    <th className="px-5 py-3 text-end">رصيد النهاية</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((row, i) => (
                    <tr key={i} className={clsx(
                      "border-b border-slate-50 hover:bg-slate-50/60 transition-colors",
                      row.ending_balance < 0 && "bg-rose-50/40"
                    )}>
                      <td className="px-5 py-3.5 font-bold text-slate-800">{row.period}</td>
                      <td className="px-5 py-3.5 text-end font-mono text-slate-600" dir="ltr">{fmtShort(row.starting_balance)}</td>
                      <td className="px-5 py-3.5 text-end font-mono font-bold text-emerald-600" dir="ltr">+{fmtShort(row.inflows)}</td>
                      <td className="px-5 py-3.5 text-end font-mono font-bold text-rose-600" dir="ltr">-{fmtShort(row.outflows)}</td>
                      <td className={clsx(
                        "px-5 py-3.5 text-end font-mono font-black",
                        row.ending_balance < 0 ? "text-rose-600" : "text-primary-600"
                      )} dir="ltr">
                        {fmtShort(row.ending_balance)}
                        {row.ending_balance < 0 && <span className="mr-1 text-rose-500">⚠</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right sidebar: Alerts + Recommendations */}
        <div className="space-y-6">
          {/* Alerts */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-900">الإنذارات المبكرة</h3>
            </div>
            <div className="p-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="flex items-start gap-3 text-emerald-700 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm">الوضع النقدي آمن</div>
                    <div className="text-xs mt-1 text-emerald-600">لا توجد مخاطر نقدية متوقعة خلال الـ 12 أسبوع القادمة.</div>
                  </div>
                </div>
              ) : alerts.map((alert, i) => (
                <div key={i} className={clsx(
                  "flex gap-3 p-4 rounded-2xl border",
                  (alert as any).status === 'critical' ? 'bg-rose-50 border-rose-100' : 'bg-amber-50 border-amber-100'
                )}>
                  <AlertTriangle className={clsx("w-5 h-5 shrink-0 mt-0.5", (alert as any).status === 'critical' ? 'text-rose-500' : 'text-amber-500')} />
                  <div>
                    <div className={clsx("font-black text-sm", (alert as any).status === 'critical' ? 'text-rose-800' : 'text-amber-800')}>
                      تحذير في {(alert as any).triggered_period}
                    </div>
                    <div className="text-xs mt-1 text-slate-600 leading-relaxed">{(alert as any).message}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">توصيات السيولة</h3>
            </div>
            <div className="p-5 space-y-3">
              {recommendations.map((rec) => (
                <div key={(rec as any).id} className="border border-slate-100 rounded-2xl p-4 bg-white hover:shadow-md transition-all cursor-pointer hover:-translate-y-0.5 duration-200">
                  <div className="flex items-start gap-3">
                    <div className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      (rec as any).type === 'collection' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    )}>
                      {(rec as any).type === 'collection' ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">
                        {(rec as any).type === 'collection' ? 'تسريع تحصيل' : 'تأجيل سداد'}
                      </div>
                      <div className="text-sm font-bold text-slate-800 leading-snug">{(rec as any).action}</div>
                      <div className="mt-2.5 text-xs font-mono font-black text-emerald-700 bg-emerald-50 inline-block px-2.5 py-1 rounded-lg border border-emerald-100">
                        التأثير: +{fmtShort((rec as any).impact_amount)} ج.م
                      </div>
                    </div>
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
