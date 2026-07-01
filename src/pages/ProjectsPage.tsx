import { useEffect, useState } from "react";
import { type Project, type ProjectAnalysis } from "../types";
import { clsx } from "clsx";
import { FolderKanban, TrendingUp, AlertTriangle, CheckCircle, PieChart, BarChart3, Activity, Wallet, Clock, Search, Filter, CalendarDays , X} from "lucide-react";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analysis, setAnalysis] = useState<ProjectAnalysis[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ 
    id: '', name: '', project_code: '', customer_name: '', start_date: '', end_date: '', 
    status: 'in_progress', budget_revenue: 0, budget_cost: 0 
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [projRes, analysisRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/projects/analysis")
      ]);
      
      if (!projRes.ok || !analysisRes.ok) throw new Error();
      
      const projData = await projRes.json();
      const analysisData = await analysisRes.json();
      
      setProjects(projData.data);
      setAnalysis(analysisData.data);
    } catch {
      const localProjects = JSON.parse(localStorage.getItem('mock_projects') || '[]');
      const localAnalysis = JSON.parse(localStorage.getItem('mock_projects_analysis') || '[]');
      
      if (localProjects.length > 0) {
        setProjects(localProjects);
        setAnalysis(localAnalysis);
      } else {
        const defaultProjects = [
          { id: 'proj_1', name: 'تطوير تطبيق موبايل', project_code: 'PRJ-001', customer_name: 'شركة الأفق', start_date: '2026-01-10', end_date: '2026-12-30', status: 'in_progress', budget_revenue: 150000, actual_revenue: 100000, budget_cost: 90000, actual_cost: 65000 },
          { id: 'proj_2', name: 'تصميم هوية بصرية', project_code: 'PRJ-002', customer_name: 'مؤسسة الرواد', start_date: '2026-03-01', end_date: '2026-04-15', status: 'completed', budget_revenue: 45000, actual_revenue: 45000, budget_cost: 15000, actual_cost: 12000 }
        ];
        const defaultAnalysis = [
          { id: 'proj_1', gross_profit: 35000, profit_margin: 35.0, revenue_variance: -50000, cost_variance: 25000 },
          { id: 'proj_2', gross_profit: 33000, profit_margin: 73.3, revenue_variance: 0, cost_variance: 3000 }
        ];
        
        localStorage.setItem('mock_projects', JSON.stringify(defaultProjects));
        localStorage.setItem('mock_projects_analysis', JSON.stringify(defaultAnalysis));
        setProjects(defaultProjects);
        setAnalysis(defaultAnalysis);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getAnalysis = (id: string) => analysis.find(a => a.id === id);

  const getStatusArabic = (status: string) => {
    switch(status) {
      case 'in_progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      case 'planned': return 'مخطط';
      default: return status;
    }
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.project_code) return;
    
    const proj: Project = {
      ...newProject,
      id: `proj_${Date.now()}`,
      actual_revenue: 0,
      actual_cost: 0,
      budget_revenue: Number(newProject.budget_revenue),
      budget_cost: Number(newProject.budget_cost)
    };
    
    const anls: ProjectAnalysis = {
      id: proj.id,
      gross_profit: 0,
      profit_margin: 0,
      revenue_variance: -proj.budget_revenue,
      cost_variance: proj.budget_cost
    };

    const updatedProjects = [proj, ...projects];
    const updatedAnalysis = [anls, ...analysis];
    
    setProjects(updatedProjects);
    setAnalysis(updatedAnalysis);
    
    localStorage.setItem('mock_projects', JSON.stringify(updatedProjects));
    localStorage.setItem('mock_projects_analysis', JSON.stringify(updatedAnalysis));
    
    setIsModalOpen(false);
    setNewProject({ id: '', name: '', project_code: '', customer_name: '', start_date: '', end_date: '', status: 'in_progress', budget_revenue: 0, budget_cost: 0 });
  };

  // Compute Dashboard Metrics
  const activeProjectsCount = projects.filter(p => p.status === 'in_progress').length;
  const totalBudgetRevenue = projects.reduce((sum, p) => sum + p.budget_revenue, 0);
  const totalActualCost = projects.reduce((sum, p) => sum + p.actual_cost, 0);
  const totalExpectedProfit = analysis.reduce((sum, a) => sum + a.gross_profit, 0);

  // Filter Projects
  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchLower) || p.project_code.toLowerCase().includes(searchLower) || p.customer_name.toLowerCase().includes(searchLower);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Calculate Progress and Burn Rate
  const calculateTimeProgress = (start: string, end: string) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const now = new Date().getTime();
    if (now > endDate) return 100;
    if (now < startDate) return 0;
    return Math.round(((now - startDate) / (endDate - startDate)) * 100);
  };

  const calculateBudgetConsumed = (actual: number, budget: number) => {
    if (budget === 0) return 0;
    return Math.min(Math.round((actual / budget) * 100), 100);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl tracking-tight">حسابات المشاريع</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">إدارة موازنات المشاريع وتحليل الأرباح والخسائر ومعدل الحرق.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
          + إضافة مشروع
        </button>
      </div>

      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 min-h-[140px]">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>المشاريع النشطة</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500"><FolderKanban className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">{activeProjectsCount}</div>
            <div className="text-xs font-bold text-slate-500 mt-2 bg-slate-50 inline-block px-2 py-1 rounded-lg">مشروع قيد التنفيذ</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 min-h-[140px]">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>إجمالي الإيرادات المتوقعة</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600"><Wallet className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalBudgetRevenue)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 min-h-[140px]">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>إجمالي التكاليف الفعلية</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500"><Activity className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalActualCost)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 min-h-[140px]">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>إجمالي الأرباح</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><TrendingUp className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalExpectedProfit)}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
         <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
               type="text" 
               placeholder="البحث باسم المشروع أو العميل أو الكود..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pr-12 pl-4 py-3 outline-none focus:border-primary-500 shadow-sm"
            />
         </div>
         <div className="relative min-w-[200px]">
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-2xl pr-12 pl-4 py-3 outline-none focus:border-primary-500 shadow-sm appearance-none"
            >
               <option value="all">جميع الحالات</option>
               <option value="in_progress">قيد التنفيذ</option>
               <option value="completed">مكتمل</option>
               <option value="planned">مخطط</option>
            </select>
         </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-3xl border-0 shadow-sm">
              <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">لا توجد مشاريع</h3>
              <p className="text-slate-500 mt-1">جرب تغيير كلمات البحث أو الفلاتر المستعملة.</p>
           </div>
        ) : filteredProjects.map(project => {
           const metrics = getAnalysis(project.id);
           const timeProgress = calculateTimeProgress(project.start_date, project.end_date);
           const costProgress = calculateBudgetConsumed(project.actual_cost, project.budget_cost);
           const isOverBudget = costProgress > timeProgress && costProgress > 50;
           
           return (
              <div key={project.id} className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                          <FolderKanban className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                             {project.name} 
                             <span className="text-xs font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-slate-500 tracking-wider">{project.project_code}</span>
                          </h3>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-4 font-medium">
                             <span>العميل: {project.customer_name}</span>
                             <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5"/> {project.start_date} إلى {project.end_date}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       {/* Burn Rate Preview */}
                       <div className="hidden md:block w-48 space-y-2">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             <span>استهلاك الميزانية</span>
                             <span className={clsx(isOverBudget ? 'text-rose-500' : 'text-slate-600')}>{costProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                             <div className={clsx("h-full transition-all duration-500", isOverBudget ? 'bg-rose-500' : 'bg-primary-500')} style={{ width: `${costProgress}%` }}></div>
                          </div>
                          
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                             <span>الوقت المنقضي</span>
                             <span>{timeProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                             <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${timeProgress}%` }}></div>
                          </div>
                       </div>

                       <span className={clsx('inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide', 
                          project.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                          project.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                       )}>
                          {getStatusArabic(project.status)}
                       </span>
                    </div>
                 </div>

                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Budget Section */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                       <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 text-center relative overflow-hidden transition-all hover:border-primary-100 hover:bg-primary-50/50">
                          <div className="absolute top-0 inset-x-0 h-1 bg-primary-500"></div>
                          <div className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">الإيرادات</div>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-start">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">الموازنة</div>
                                <div className="font-mono font-medium text-slate-600 text-sm" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.budget_revenue)}</div>
                             </div>
                             <div className="text-end">
                                <div className="text-[10px] text-primary-400 font-bold uppercase mb-1">الفعلي</div>
                                <div className="font-mono font-bold text-primary-600 text-xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.actual_revenue)}</div>
                             </div>
                          </div>
                       </div>

                       <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 text-center relative overflow-hidden transition-all hover:border-rose-100 hover:bg-rose-50/50">
                          <div className="absolute top-0 inset-x-0 h-1 bg-rose-500"></div>
                          <div className="text-xs text-slate-500 font-bold mb-3 uppercase tracking-wider">التكاليف</div>
                          <div className="flex justify-between items-end mt-2">
                             <div className="text-start">
                                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">الموازنة</div>
                                <div className="font-mono font-medium text-slate-600 text-sm" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.budget_cost)}</div>
                             </div>
                             <div className="text-end">
                                <div className="text-[10px] text-rose-400 font-bold uppercase mb-1">الفعلي</div>
                                <div className="font-mono font-bold text-rose-600 text-xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(project.actual_cost)}</div>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* Analysis Section */}
                    {metrics && (
                       <>
                          <div className="border border-slate-100 rounded-2xl p-5 bg-emerald-50/30 flex flex-col justify-center">
                             <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs text-emerald-800 font-bold uppercase">الربح الإجمالي</span>
                             </div>
                             <div className="font-mono font-black text-2xl text-emerald-700" dir="ltr">
                                {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(metrics.gross_profit)}
                             </div>
                             <div className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1.5">
                                <PieChart className="w-3.5 h-3.5" /> هامش الربح: {metrics.profit_margin.toFixed(2)}%
                             </div>
                          </div>

                          <div className="border border-slate-100 rounded-2xl p-5 flex flex-col justify-center bg-slate-50/30">
                             <div className="flex items-center gap-2 mb-3">
                                <BarChart3 className="w-4 h-4 text-slate-600" />
                                <span className="text-xs text-slate-600 font-bold uppercase">انحراف الموازنة</span>
                             </div>
                             <div className="space-y-3">
                                <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                   <span className="text-slate-500 text-xs font-medium">تباين الإيرادات:</span>
                                   <span className={clsx("font-mono font-bold text-xs", metrics.revenue_variance >= 0 ? 'text-emerald-600' : 'text-rose-600')} dir="ltr">
                                      {metrics.revenue_variance >= 0 ? '+' : ''}{new Intl.NumberFormat('ar-EG').format(metrics.revenue_variance)}
                                   </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                   <span className="text-slate-500 text-xs font-medium">وفر التكاليف:</span>
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

      {isModalOpen && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg transform transition-all border border-white">
             <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50">
               <h3 className="text-xl font-bold text-slate-800">إضافة مشروع جديد</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">كود المشروع</label>
                   <input type="text" value={newProject.project_code} onChange={e => setNewProject({...newProject, project_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 font-mono transition-all" placeholder="PRJ-003" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">اسم المشروع</label>
                   <input type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="مثال: نظام إدارة" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">اسم العميل</label>
                 <input type="text" value={newProject.customer_name} onChange={e => setNewProject({...newProject, customer_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="شركة..." />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ البدء</label>
                   <input type="date" value={newProject.start_date} onChange={e => setNewProject({...newProject, start_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-all" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الانتهاء</label>
                   <input type="date" value={newProject.end_date} onChange={e => setNewProject({...newProject, end_date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-all" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">موازنة الإيرادات</label>
                   <input type="number" value={newProject.budget_revenue || ''} onChange={e => setNewProject({...newProject, budget_revenue: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 font-mono transition-all" placeholder="0.00" />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">موازنة التكاليف</label>
                   <input type="number" value={newProject.budget_cost || ''} onChange={e => setNewProject({...newProject, budget_cost: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 font-mono transition-all" placeholder="0.00" />
                 </div>
               </div>
               <button onClick={handleAddProject} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 mt-4">
                 حفظ المشروع
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
