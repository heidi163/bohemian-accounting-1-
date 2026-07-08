import { useEffect, useState } from "react";
import { type CostCenter } from "../types";
import { clsx } from "clsx";
import { Target, Users, FolderTree, ArrowDownRight, ArrowUpRight, ChevronRight, ChevronDown, Activity, DollarSign, Wallet, PieChart as PieChartIcon, X } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function CostCentersPage() {
  const [costCentersTree, setCostCentersTree] = useState<CostCenter[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['HQ']));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCenter, setNewCenter] = useState({ id: '', name: '', manager_name: '', parent_id: 'HQ' });

  const fetchCostCenters = () => {
    fetch("/api/cost-centers")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => {
        setCostCentersTree(data.data);
      })
      .catch(() => {
        const localCenters = JSON.parse(localStorage.getItem(getCompanyKey('mock_cost_centers')) || '[]');
        
        // Quick migration to fix O2N and BGK swap if they have the old default data
        if (localCenters.length > 0 && localCenters[0].children?.[0]?.name?.includes('BGK')) {
          const defaults = [
            {
              id: "HQ",
              name: "المركز الرئيسي (المقر)",
              manager_name: "أحمد صلاح",
              budget: 5000000,
              actual_cost: 4200000,
              revenue: 12000000,
              children: [
                { id: "TECH", name: "قطاع التكنولوجيا (O2N)", manager_name: "محمد علي", budget: 2000000, actual_cost: 2100000, revenue: 8000000, children: [] },
                { id: "MKT", name: "قطاع التسويق (BGK)", manager_name: "سارة أحمد", budget: 1500000, actual_cost: 1200000, revenue: 4000000, children: [] }
              ]
            }
          ];
          localStorage.setItem(getCompanyKey('mock_cost_centers'), JSON.stringify(defaults));
          setCostCentersTree(defaults);
          return;
        }

        if (localCenters.length > 0) {
          setCostCentersTree(localCenters);
        } else {
            const defaults = [
            {
              id: "HQ",
              name: "المركز الرئيسي (المقر)",
              manager_name: "أحمد صلاح",
              budget: 5000000,
              actual_cost: 4200000,
              revenue: 12000000,
              children: [
                { id: "TECH", name: "قطاع التكنولوجيا (O2N)", manager_name: "محمد علي", budget: 2000000, actual_cost: 2100000, revenue: 8000000, children: [] },
                { id: "MKT", name: "قطاع التسويق (BGK)", manager_name: "سارة أحمد", budget: 1500000, actual_cost: 1200000, revenue: 4000000, children: [] }
              ]
            }
          ];
          localStorage.setItem(getCompanyKey('mock_cost_centers'), JSON.stringify(defaults));
          setCostCentersTree(defaults);
        }
      });
  };

  useEffect(() => {
    fetchCostCenters();
  }, []);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  // Calculate totals for dashboard
  const totalBudget = costCentersTree.reduce((acc, curr) => acc + curr.budget, 0);
  const totalActual = costCentersTree.reduce((acc, curr) => acc + curr.actual_cost, 0);
  const totalRevenue = costCentersTree.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalVariance = totalBudget - totalActual;

  const chartData = costCentersTree[0]?.children?.map(child => ({
    name: child.name.split(' (')[0].trim(), // Remove bracket part for chart labels
    الموازنة: child.budget,
    التكلفة: child.actual_cost,
    الإيرادات: child.revenue
  })) || [];

  const renderTree = (nodes: CostCenter[], level = 0) => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      
      const netProfit = node.revenue - node.actual_cost;
      const utilizationPercent = node.budget > 0 ? (node.actual_cost / node.budget) * 100 : 0;

      return (
        <div key={node.id} className="w-full">
          <div 
             className={clsx(
                "flex items-center gap-4 py-4 px-6 hover:bg-slate-50 transition border-b border-slate-100",
                level === 0 ? "bg-slate-50/50" : ""
             )}
             style={{ paddingInlineStart: `${(level * 2) + 1.5}rem` }}
          >
             <div className="flex items-center gap-2 w-1/3">
                {hasChildren ? (
                   <button onClick={() => toggleNode(node.id)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                   </button>
                ) : (
                   <div className="w-6 h-6" /> // spacer
                )}
                <div className="flex items-center gap-3">
                   <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", level === 0 ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-500")}>
                     <FolderTree className="w-4 h-4" />
                   </div>
                   <div className="flex flex-col">
                      <span className={clsx("font-bold text-sm", level === 0 ? "text-slate-900" : "text-slate-700")}>{node.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider">{node.id}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col justify-center">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">المدير المسؤول</span>
                   <span className="font-bold text-slate-700 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-slate-400"/> {node.manager_name}</span>
                </div>
                <div className="flex flex-col text-end justify-center">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">التكلفة / الموازنة</span>
                   <div className="font-mono font-black text-slate-900" dir="ltr">
                      {new Intl.NumberFormat('ar-EG').format(node.actual_cost)} <span className="text-slate-400 font-medium text-xs">/ {new Intl.NumberFormat('ar-EG', { notation: 'compact' }).format(node.budget)}</span>
                   </div>
                   <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div className={clsx("h-full", utilizationPercent > 100 ? "bg-rose-500" : utilizationPercent > 80 ? "bg-amber-500" : "bg-primary-500")} style={{ width: `${Math.min(utilizationPercent, 100)}%` }}></div>
                   </div>
                </div>
                <div className="flex flex-col text-end justify-center">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">الإيرادات المحققة</span>
                   <span className="font-mono font-black text-primary-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(node.revenue)}</span>
                </div>
                <div className="flex flex-col text-end justify-center">
                   <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">الربح الصافي</span>
                   <span className={clsx("font-mono font-black text-lg flex items-center justify-end gap-1", netProfit >= 0 ? "text-primary-600" : "text-rose-600")} dir="ltr">
                      {netProfit >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {new Intl.NumberFormat('ar-EG').format(Math.abs(netProfit))}
                   </span>
                </div>
             </div>
          </div>
          
          {hasChildren && isExpanded && (
            <div className="w-full">
              {renderTree(node.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl tracking-tight">مراكز التكلفة (Cost Centers)</h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">لوحة تحكم تفصيلية لإدارة الهيكل الشجري وتوزيع الميزانيات وتحليل الأرباح والخسائر لكل قسم.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-primary-600 text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5">
          + إضافة مركز تكلفة
        </button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>الموازنة المعتمدة</span>
            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500"><Wallet className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalBudget)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>التكلفة الفعلية</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500"><Activity className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalActual)}
            </div>
            <div className="text-xs font-bold text-rose-500 mt-2 bg-rose-50 inline-block px-2 py-1 rounded-lg">
              تم استهلاك {Math.round((totalActual / totalBudget) * 100)}%
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>الوفر / (التجاوز)</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600"><PieChartIcon className="w-5 h-5"/></div>
          </div>
          <div>
            <div className={clsx("text-3xl font-black tracking-tight", totalVariance >= 0 ? "text-primary-600" : "text-rose-600")} dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(Math.abs(totalVariance))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between min-h-[140px] hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-4 flex justify-between items-center">
            <span>الإيرادات المولدة</span>
            <div className="w-10 h-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600"><DollarSign className="w-5 h-5"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">
               {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumSignificantDigits: 4 }).format(totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Hierarchy Tree */}
         <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white">
               <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><FolderTree className="w-5 h-5 text-primary-500" /> الهيكل الشجري للمراكز</h3>
            </div>
            <div className="flex flex-col w-full flex-1 overflow-x-auto bg-white">
               <div className="min-w-[800px]">
                  {renderTree(costCentersTree)}
               </div>
            </div>
         </div>

         {/* Chart Widget */}
         <div className="lg:col-span-1 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2 mb-6"><Target className="w-5 h-5 text-primary-500" /> أداء المراكز الفرعية</h3>
            <div className="flex-1 min-h-[300px]" style={{ direction: 'ltr' }}>
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="horizontal" margin={{ top: 10, right: 0, left: 10, bottom: 20 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" opacity={0.5} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={10} interval={0} angle={-25} textAnchor="end" height={60} />
                   <YAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)} width={40} />
                   <Tooltip cursor={{ fill: '#f8fafc', radius: 8 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'right' }} formatter={(value: number) => new Intl.NumberFormat('ar-EG').format(value)} />
                   <Bar dataKey="التكلفة" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} name="التكلفة الفعلية" />
                   <Bar dataKey="الإيرادات" fill="var(--color-primary-500)" radius={[4, 4, 0, 0]} barSize={12} name="الإيرادات" />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-md transform transition-all border border-white">
             <div className="flex items-center justify-between p-6 border-b border-slate-50 bg-slate-50/50">
               <h3 className="text-xl font-bold text-slate-800">إضافة مركز تكلفة جديد</h3>
               <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"><X className="w-5 h-5" /></button>
             </div>
             <div className="p-6 space-y-5">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">كود المركز</label>
                 <input type="text" value={newCenter.id} onChange={e => setNewCenter({...newCenter, id: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-mono" placeholder="مثال: HR" />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">اسم المركز</label>
                 <input type="text" value={newCenter.name} onChange={e => setNewCenter({...newCenter, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="مثال: الموارد البشرية" />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">اسم المدير المسؤول</label>
                 <input type="text" value={newCenter.manager_name} onChange={e => setNewCenter({...newCenter, manager_name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all" placeholder="مثال: أحمد محمود" />
               </div>
               <button onClick={() => {
                 if (!newCenter.id || !newCenter.name) return;
                 const localCenters = JSON.parse(localStorage.getItem(getCompanyKey('mock_cost_centers')) || '[]');
                 const addNode = (nodes: any[]) => {
                   for (let node of nodes) {
                     if (node.id === newCenter.parent_id) {
                       node.children = node.children || [];
                       node.children.push({ ...newCenter, budget: 0, actual_cost: 0, revenue: 0, children: [] });
                       return true;
                     }
                     if (node.children && addNode(node.children)) return true;
                   }
                   return false;
                 };
                 addNode(localCenters);
                 localStorage.setItem(getCompanyKey('mock_cost_centers'), JSON.stringify(localCenters));
                 setCostCentersTree(localCenters);
                 setIsModalOpen(false);
                 setNewCenter({ id: '', name: '', manager_name: '', parent_id: 'HQ' });
                 setExpandedNodes(new Set(expandedNodes).add('HQ'));
               }} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition shadow-sm hover:shadow-md hover:-translate-y-0.5 mt-2">
                 حفظ المركز وإضافته
               </button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
