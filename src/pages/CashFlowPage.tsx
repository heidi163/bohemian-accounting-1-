import { useEffect, useState } from "react";
import { type CashForecast, type CrisisAlert, type Recommendation, type ScenarioType } from "../types";
import { clsx } from "clsx";
import { LineChart, AlertTriangle, Lightbulb, ArrowUpRight, ArrowDownRight, Settings2, Activity, CheckCircle, Clock } from "lucide-react";

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
    } catch (e) {
      // Fallback for Vercel static deployment
      const mockForecast = [
        { period: "الأسبوع 1", starting_balance: 1500000, inflows: scenario === 'optimistic' ? 600000 : scenario === 'pessimistic' ? 400000 : 500000, outflows: 200000, ending_balance: scenario === 'optimistic' ? 1900000 : scenario === 'pessimistic' ? 1700000 : 1800000 },
        { period: "الأسبوع 2", starting_balance: scenario === 'optimistic' ? 1900000 : scenario === 'pessimistic' ? 1700000 : 1800000, inflows: 100000, outflows: 400000, ending_balance: scenario === 'optimistic' ? 1600000 : scenario === 'pessimistic' ? 1400000 : 1500000 },
        { period: "الأسبوع 3", starting_balance: scenario === 'optimistic' ? 1600000 : scenario === 'pessimistic' ? 1400000 : 1500000, inflows: 0, outflows: 1600000, ending_balance: scenario === 'optimistic' ? 0 : scenario === 'pessimistic' ? -200000 : -100000 }
      ];
      setForecast(mockForecast);
      
      const mockInsights = {
        alerts: scenario === 'optimistic' ? [] : [
          { status: "critical", triggered_period: "الأسبوع 3", message: "عجز متوقع بسبب مدفوعات الموردين وجدولة الرواتب." }
        ],
        recommendations: [
          { id: "1", type: "collection", action: "تسريع تحصيل فاتورة (شركة الأمل)", impact_amount: 150000 },
          { id: "2", type: "payment", action: "تأجيل سداد دفعة مورد (مكتب جرير) لأسبوع 4", impact_amount: 80000 }
        ]
      };
      setAlerts(mockInsights.alerts as any);
      setRecommendations(mockInsights.recommendations as any);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, [scenario]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">توقعات التدفق النقدي (Cash Flow Forecast)</h2>
          <p className="text-slate-500 mt-1">تحليل التوقعات المستقبلية للسيولة ومحاكاة السيناريوهات المختلفة.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           {(['optimistic', 'realistic', 'pessimistic'] as ScenarioType[]).map(s => (
              <button
                 key={s}
                 onClick={() => setScenario(s)}
                 className={clsx(
                    "px-4 py-2 rounded-lg text-sm font-bold capitalize transition",
                    scenario === s ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                 )}
              >
                 {s === 'optimistic' ? 'متفائل (Optimistic)' : s === 'realistic' ? 'واقعي (Realistic)' : 'متشائم (Pessimistic)'}
              </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Forecast Board */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-slate-700">توقعات 12 أسبوع (12-Week Projection)</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse text-sm">
                     <thead className="bg-white text-slate-400 font-bold uppercase text-xs">
                        <tr className="border-b border-slate-100">
                           <th className="px-4 py-3 text-start">الفترة</th>
                           <th className="px-4 py-3 text-end">رصيد البداية</th>
                           <th className="px-4 py-3 text-end">المقبوضات (+)</th>
                           <th className="px-4 py-3 text-end">المدفوعات (-)</th>
                           <th className="px-4 py-3 text-end">رصيد النهاية</th>
                        </tr>
                     </thead>
                     <tbody className="text-slate-600 font-mono">
                        {forecast.map((row, index) => (
                           <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-start font-bold text-slate-700">{row.period}</td>
                              <td className="px-4 py-3 text-end" dir="ltr">{new Intl.NumberFormat('ar-EG').format(row.starting_balance)}</td>
                              <td className="px-4 py-3 text-end text-emerald-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(row.inflows)}</td>
                              <td className="px-4 py-3 text-end text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(row.outflows)}</td>
                              <td className={clsx("px-4 py-3 text-end font-black", row.ending_balance < 0 ? "text-rose-600" : "text-primary-600")} dir="ltr">
                                 {new Intl.NumberFormat('ar-EG').format(row.ending_balance)}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Insights & Recommendations Sidebar */}
         <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-600" />
                  <h3 className="font-bold text-slate-700">الإنذارات المبكرة (Crisis Alerts)</h3>
               </div>
               <div className="p-4 space-y-3">
                  {alerts.length === 0 ? (
                     <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        <span className="text-sm font-bold">الوضع النقدي آمن للـ 12 أسبوع القادمة.</span>
                     </div>
                  ) : (
                     alerts.map((alert, i) => (
                        <div key={i} className={clsx(
                           "flex gap-3 p-3 rounded-xl border",
                           alert.status === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-800' : 'bg-amber-50 border-amber-100 text-amber-800'
                        )}>
                           <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                           <div>
                              <div className="font-bold text-sm">تحذير في {alert.triggered_period}</div>
                              <div className="text-xs mt-1 opacity-90">{alert.message}</div>
                           </div>
                        </div>
                     ))
                  )}
               </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-700">توصيات السيولة (Recommendations)</h3>
               </div>
               <div className="p-4 space-y-3">
                  {recommendations.map((rec) => (
                     <div key={rec.id} className="border border-slate-100 rounded-xl p-3 bg-white shadow-sm hover:shadow transition cursor-pointer">
                        <div className="flex items-start gap-3">
                           <div className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              rec.type === 'collection' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                           )}>
                              {rec.type === 'collection' ? <ArrowDownRight className="w-4 h-4"/> : <ArrowUpRight className="w-4 h-4"/>}
                           </div>
                           <div>
                              <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">
                                 {rec.type === 'collection' ? 'تسريع تحصيل' : 'تأجيل سداد'}
                              </div>
                              <div className="text-sm font-medium text-slate-800 leading-snug">{rec.action}</div>
                              <div className="mt-2 text-xs font-mono font-bold text-primary-600 bg-primary-50 inline-block px-2 py-1 rounded">
                                 التأثير: +{new Intl.NumberFormat('ar-EG').format(rec.impact_amount)}
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
