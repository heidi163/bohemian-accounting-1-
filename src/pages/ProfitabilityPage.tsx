import { useEffect, useState } from "react";
import { type ClientProfitability, type ProjectProfitabilityRanking } from "../types";
import { clsx } from "clsx";
import { Trophy, TrendingDown, Users, FolderKanban, BarChart4, DollarSign, Percent } from "lucide-react";

export function ProfitabilityPage() {
  const [topClients, setTopClients] = useState<ClientProfitability[]>([]);
  const [unprofitableClients, setUnprofitableClients] = useState<ClientProfitability[]>([]);
  const [topProjects, setTopProjects] = useState<ProjectProfitabilityRanking[]>([]);

  const fetchRankings = () => {
    fetch("/api/profitability/rankings")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setTopClients(data.data.topClients);
        setUnprofitableClients(data.data.unprofitableClients);
        setTopProjects(data.data.topProjects);
      })
      .catch(() => {
        setTopClients([
          { client_id: 1, client_name: 'شركة الأفق للتجارة', total_revenue: 1200000, total_cost: 800000, net_profit: 400000, profit_margin: 33.3 },
          { client_id: 2, client_name: 'مؤسسة الرواد', total_revenue: 850000, total_cost: 600000, net_profit: 250000, profit_margin: 29.4 }
        ]);
        setUnprofitableClients([
          { client_id: 3, client_name: 'جلوبال تيك', total_revenue: 150000, total_cost: 180000, net_profit: -30000, profit_margin: -20.0 }
        ]);
        setTopProjects([
          { id: '1', project_name: 'تطوير منصة التجارة', project_code: 'P-001', customer_name: 'شركة الأفق للتجارة', start_date: '2026-01-01', end_date: '2026-06-30', status: 'completed', budget_revenue: 500000, actual_revenue: 520000, budget_cost: 300000, actual_cost: 290000, gross_profit: 230000, profit_margin: 44.2, allocated_overhead: 30000, net_profit: 200000 }
        ]);
      });
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">تحليل الربحية (Profitability Analysis)</h2>
          <p className="text-slate-500 mt-1">تقييم شامل لربحية العملاء والمشاريع مضافاً إليها التكاليف غير المباشرة.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Client Profitability */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Trophy className="w-5 h-5 text-emerald-600" />
                     <h3 className="font-bold text-emerald-900">أفضل العملاء (Top Clients)</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">حسب صافي الربح</span>
               </div>
               <div className="p-0">
                  <table className="w-full text-start text-sm">
                     <thead className="bg-slate-50 text-slate-400 font-bold text-xs uppercase border-b border-slate-100">
                        <tr>
                           <th className="px-4 py-3 text-start">العميل</th>
                           <th className="px-4 py-3 text-end">الإيراد</th>
                           <th className="px-4 py-3 text-end">التكلفة</th>
                           <th className="px-4 py-3 text-end">صافي الربح</th>
                           <th className="px-4 py-3 text-center">الهامش</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {topClients.map((client, idx) => (
                           <tr key={client.client_id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">{idx + 1}</div>
                                 {client.client_name}
                              </td>
                              <td className="px-4 py-3 text-end font-mono text-slate-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.total_revenue)}</td>
                              <td className="px-4 py-3 text-end font-mono text-slate-400" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.total_cost)}</td>
                              <td className="px-4 py-3 text-end font-mono font-bold text-emerald-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.net_profit)}</td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">{client.profit_margin.toFixed(1)}%</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {unprofitableClients.length > 0 && (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-rose-600" />
                        <h3 className="font-bold text-rose-900">عملاء غير مربحين (Unprofitable Clients)</h3>
                     </div>
                  </div>
                  <div className="p-0">
                     <table className="w-full text-start text-sm">
                        <thead className="bg-slate-50 text-slate-400 font-bold text-xs uppercase border-b border-slate-100">
                           <tr>
                              <th className="px-4 py-3 text-start">العميل</th>
                              <th className="px-4 py-3 text-end">الإيراد</th>
                              <th className="px-4 py-3 text-end">التكلفة</th>
                              <th className="px-4 py-3 text-end">الخسارة</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {unprofitableClients.map(client => (
                              <tr key={client.client_id} className="hover:bg-slate-50 transition">
                                 <td className="px-4 py-3 font-bold text-slate-800">{client.client_name}</td>
                                 <td className="px-4 py-3 text-end font-mono text-slate-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.total_revenue)}</td>
                                 <td className="px-4 py-3 text-end font-mono text-slate-400" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.total_cost)}</td>
                                 <td className="px-4 py-3 text-end font-mono font-bold text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(Math.abs(client.net_profit))}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
         </div>

         {/* Project Profitability */}
         <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <FolderKanban className="w-5 h-5 text-primary-600" />
                     <h3 className="font-bold text-primary-900">أكثر المشاريع ربحية (Top Projects)</h3>
                  </div>
                  <span className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-full">بعد تحميل المصاريف غير المباشرة</span>
               </div>
               <div className="p-6 space-y-6">
                  {topProjects.map((project, idx) => (
                     <div key={project.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm relative overflow-hidden">
                        {idx === 0 && <div className="absolute top-0 end-0 w-16 h-16 bg-yellow-100 transform rotate-45 translate-x-8 -translate-y-8 flex items-end justify-center pb-1"><Trophy className="w-4 h-4 text-yellow-600 -rotate-45" /></div>}
                        
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h4 className="font-bold text-lg text-slate-900">{project.project_name}</h4>
                              <div className="text-sm text-slate-500">{project.customer_name}</div>
                           </div>
                           <div className="text-end">
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">هامش الربح (Margin)</div>
                              <div className="font-mono font-black text-xl text-primary-600">{project.profit_margin.toFixed(1)}%</div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 rounded-lg p-3 border border-slate-100">
                           <div>
                              <div className="flex justify-between mb-1">
                                 <span className="text-slate-500">الربح الإجمالي (Gross):</span>
                                 <span className="font-mono font-bold text-slate-700" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.gross_profit)}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-slate-500">ت. غير مباشرة (Overhead):</span>
                                 <span className="font-mono font-medium text-rose-500" dir="ltr">-{new Intl.NumberFormat('ar-EG').format(project.allocated_overhead || 0)}</span>
                              </div>
                           </div>
                           <div className="border-l border-slate-200 ps-4 flex flex-col justify-center items-end">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">صافي الربح الفعلي (Net)</span>
                              <span className={clsx("font-mono font-black text-lg", project.net_profit >= 0 ? "text-emerald-600" : "text-rose-600")} dir="ltr">
                                 {new Intl.NumberFormat('ar-EG').format(project.net_profit)}
                              </span>
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
