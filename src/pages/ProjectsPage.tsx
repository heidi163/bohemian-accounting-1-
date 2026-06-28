import { useEffect, useState } from "react";
import { type Project, type ProjectAnalysis } from "../types";
import { clsx } from "clsx";
import { FolderKanban, TrendingUp, AlertTriangle, CheckCircle, PieChart, BarChart3, Activity } from "lucide-react";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analysis, setAnalysis] = useState<ProjectAnalysis[]>([]);

  const fetchData = async () => {
    const [projRes, analysisRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/projects/analysis")
    ]);
    
    const projData = await projRes.json();
    const analysisData = await analysisRes.json();
    
    setProjects(projData.data);
    setAnalysis(analysisData.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAnalysis = (id: string) => analysis.find(a => a.id === id);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">حسابات المشاريع (Project Accounting)</h2>
          <p className="text-slate-500 mt-1">إدارة موازنات المشاريع وتحليل الأرباح والخسائر والتباين.</p>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map(project => {
           const metrics = getAnalysis(project.id);
           
           return (
              <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                          <FolderKanban className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                             {project.name} 
                             <span className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-500">{project.project_code}</span>
                          </h3>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                             <span>العميل: {project.customer_name}</span>
                             <span>المدة: {project.start_date} إلى {project.end_date}</span>
                          </div>
                       </div>
                    </div>
                    <div>
                       <span className={clsx('inline-flex items-center rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider', 
                          project.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                          project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                       )}>
                          {project.status.replace('_', ' ')}
                       </span>
                    </div>
                 </div>

                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Budget Section */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                       <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-center relative overflow-hidden">
                          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500"></div>
                          <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">الإيرادات (Revenue)</div>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-start">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">الموازنة (Budget)</div>
                                <div className="font-mono font-medium text-slate-600 text-sm" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.budget_revenue)}</div>
                             </div>
                             <div className="text-end">
                                <div className="text-[10px] text-primary-400 font-bold uppercase">الفعلي (Actual)</div>
                                <div className="font-mono font-bold text-primary-600 text-lg" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.actual_revenue)}</div>
                             </div>
                          </div>
                       </div>

                       <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 text-center relative overflow-hidden">
                          <div className="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
                          <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">التكاليف (Costs)</div>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-start">
                                <div className="text-[10px] text-slate-400 font-bold uppercase">الموازنة (Budget)</div>
                                <div className="font-mono font-medium text-slate-600 text-sm" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.budget_cost)}</div>
                             </div>
                             <div className="text-end">
                                <div className="text-[10px] text-rose-400 font-bold uppercase">الفعلي (Actual)</div>
                                <div className="font-mono font-bold text-rose-600 text-lg" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.actual_cost)}</div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Analysis Section */}
                    {metrics && (
                       <>
                          <div className="border border-slate-100 rounded-xl p-4 bg-emerald-50/50 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs text-emerald-800 font-bold uppercase">الربح الإجمالي (Gross Profit)</span>
                             </div>
                             <div className="font-mono font-black text-2xl text-emerald-700" dir="ltr">
                                {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(metrics.gross_profit)}
                             </div>
                             <div className="text-xs text-emerald-600 mt-1 font-bold flex items-center gap-1">
                                <PieChart className="w-3 h-3" /> هامش الربح: {metrics.profit_margin.toFixed(2)}%
                             </div>
                          </div>

                          <div className="border border-slate-100 rounded-xl p-4 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="w-4 h-4 text-slate-600" />
                                <span className="text-xs text-slate-600 font-bold uppercase">انحراف الموازنة (Variance)</span>
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between text-sm border-b border-slate-100 pb-1">
                                   <span className="text-slate-500 text-xs">تباين الإيرادات:</span>
                                   <span className={clsx("font-mono font-bold text-xs", metrics.revenue_variance >= 0 ? 'text-emerald-600' : 'text-rose-600')} dir="ltr">
                                      {metrics.revenue_variance >= 0 ? '+' : ''}{new Intl.NumberFormat('ar-EG').format(metrics.revenue_variance)}
                                   </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                   <span className="text-slate-500 text-xs">وفر التكاليف:</span>
                                   <span className={clsx("font-mono font-bold text-xs", metrics.cost_variance >= 0 ? 'text-emerald-600' : 'text-rose-600')} dir="ltr">
                                      {metrics.cost_variance >= 0 ? '+' : ''}{new Intl.NumberFormat('ar-EG').format(metrics.cost_variance)}
                                   </span>
                                </div>
                             </div>
                          </div>
                       </>
                    )}
                 </div>
              </div>
           )
        })}
      </div>
    </div>
  );
}
