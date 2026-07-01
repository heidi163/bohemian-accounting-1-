import { useEffect, useState } from "react";
import { type ClientProfitability, type ProjectProfitabilityRanking } from "../types";
import { clsx } from "clsx";
import { Trophy, TrendingDown, Users, FolderKanban, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";

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

  const totalTopClientsProfit = topClients.reduce((acc, curr) => acc + curr.net_profit, 0);
  const avgTopClientsMargin = topClients.length > 0 ? topClients.reduce((acc, curr) => acc + curr.profit_margin, 0) / topClients.length : 0;
  const totalLoss = unprofitableClients.reduce((acc, curr) => acc + Math.abs(curr.net_profit), 0);

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h2 className="font-bold text-slate-800 text-2xl tracking-tight">تحليل الربحية (Profitability Analysis)</h2>
        <p className="text-slate-500 mt-2 text-sm font-medium">لوحة تحكم تفصيلية لتقييم الأرباح الفعلية للعملاء والمشاريع شاملة التكاليف غير المباشرة.</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>إجمالي أرباح أفضل العملاء</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors"><Trophy className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalTopClientsProfit)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>متوسط هامش الربح</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors"><Target className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {avgTopClientsMargin.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300 group">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>خسائر العملاء غير المربحين</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:bg-rose-100 transition-colors"><TrendingDown className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalLoss)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Client Profitability */}
         <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-500" />
              أفضل العملاء (Top Clients)
            </h3>
            
            <div className="flex flex-col gap-4">
              {topClients.map((client, idx) => (
                <div key={client.client_id} className="p-5 rounded-3xl bg-white shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black font-mono text-lg shrink-0">
                         #{idx + 1}
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 text-lg group-hover:text-primary-600 transition-colors">{client.client_name}</h4>
                         <div className="text-sm font-semibold text-slate-500 mt-1 flex gap-2">
                           <span>إيراد: <span dir="ltr" className="text-slate-700">{new Intl.NumberFormat('ar-EG').format(client.total_revenue)}</span></span>
                           <span className="text-slate-300">•</span>
                           <span>تكلفة: <span dir="ltr" className="text-slate-700">{new Intl.NumberFormat('ar-EG').format(client.total_cost)}</span></span>
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-6 w-full sm:w-auto bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                      <div className="text-end flex-1 sm:flex-none">
                         <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider mb-1">صافي الربح</div>
                         <div className="font-black text-primary-600 text-xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(client.net_profit)}</div>
                      </div>
                      <div className="w-px h-10 bg-slate-200 hidden sm:block"></div>
                      <div className="text-end flex-1 sm:flex-none">
                         <div className="text-[11px] text-slate-400 font-black uppercase tracking-wider mb-1">الهامش</div>
                         <div className="font-black text-slate-800 text-lg bg-primary-50 px-3 py-1 rounded-xl inline-block">{client.profit_margin.toFixed(1)}%</div>
                      </div>
                   </div>
                </div>
              ))}
            </div>

            {unprofitableClients.length > 0 && (
               <div className="pt-4">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-4">
                    <TrendingDown className="w-5 h-5 text-rose-500" />
                    عملاء يجب مراجعتهم (Unprofitable)
                  </h3>
                  <div className="flex flex-col gap-4">
                    {unprofitableClients.map((client) => (
                      <div key={client.client_id} className="p-5 rounded-3xl bg-white shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                         <div>
                            <h4 className="font-bold text-slate-900 text-lg">{client.client_name}</h4>
                            <div className="text-sm font-semibold text-slate-500 mt-1 flex gap-2">
                              <span>إيراد: <span dir="ltr" className="text-slate-700">{new Intl.NumberFormat('ar-EG').format(client.total_revenue)}</span></span>
                              <span className="text-slate-300">•</span>
                              <span>تكلفة: <span dir="ltr" className="text-slate-700">{new Intl.NumberFormat('ar-EG').format(client.total_cost)}</span></span>
                            </div>
                         </div>
                         <div className="bg-rose-50 px-4 py-3 rounded-2xl text-end w-full sm:w-auto border border-rose-100/50">
                            <div className="text-[11px] text-rose-400 font-black uppercase tracking-wider mb-1">الخسارة الصافية</div>
                            <div className="font-black text-rose-600 text-xl" dir="ltr">-{new Intl.NumberFormat('ar-EG').format(Math.abs(client.net_profit))}</div>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
         </div>

         {/* Project Profitability */}
         <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-primary-500" />
              أكثر المشاريع ربحية (Top Projects)
            </h3>
            
            <div className="flex flex-col gap-4">
               {topProjects.map((project, idx) => (
                  <div key={project.id} className="p-6 rounded-3xl bg-white shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 flex flex-col gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all group">
                     <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                              {idx === 0 ? <Trophy className="w-6 h-6 text-yellow-500" /> : <FolderKanban className="w-6 h-6" />}
                           </div>
                           <div>
                              <h4 className="font-bold text-xl text-slate-900 group-hover:text-primary-600 transition-colors">{project.project_name}</h4>
                              <div className="text-sm font-semibold text-slate-500 mt-1">{project.customer_name}</div>
                           </div>
                        </div>
                        <div className="text-end bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                           <div className="text-[11px] text-slate-500 font-black uppercase tracking-wider mb-0.5">الهامش</div>
                           <div className="font-mono font-black text-xl text-slate-800">{project.profit_margin.toFixed(1)}%</div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                        <div className="space-y-3">
                           <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-bold">الربح الإجمالي (Gross):</span>
                              <span className="font-mono font-black text-slate-700" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.gross_profit)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-slate-500 font-bold">ت. غير مباشرة:</span>
                              <span className="font-mono font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg" dir="ltr">-{new Intl.NumberFormat('ar-EG').format(project.allocated_overhead || 0)}</span>
                           </div>
                        </div>
                        <div className="border-r border-slate-200 pr-5 flex flex-col justify-center items-end">
                           <span className="text-[11px] text-primary-600/80 font-black uppercase tracking-wider mb-1">صافي الربح (Net)</span>
                           <span className={clsx("font-mono font-black text-3xl", project.net_profit >= 0 ? "text-primary-600" : "text-rose-600")} dir="ltr">
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
  );
}
