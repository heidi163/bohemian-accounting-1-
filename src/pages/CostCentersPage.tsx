import { useEffect, useState } from "react";
import { type CostCenter } from "../types";
import { clsx } from "clsx";
import { Target, Users, FolderTree, ArrowDownRight, ArrowUpRight, ChevronRight, ChevronDown, Activity } from "lucide-react";

export function CostCentersPage() {
  const [costCentersTree, setCostCentersTree] = useState<CostCenter[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['HQ']));

  const fetchCostCenters = () => {
    fetch("/api/cost-centers")
      .then((res) => res.json())
      .then((data) => {
        setCostCentersTree(data.data);
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

  const renderTree = (nodes: CostCenter[], level = 0) => {
    return nodes.map(node => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expandedNodes.has(node.id);
      
      const netProfit = node.revenue - node.actual_cost;
      const budgetVariance = node.budget - node.actual_cost;
      const utilizationPercent = node.budget > 0 ? (node.actual_cost / node.budget) * 100 : 0;

      return (
        <div key={node.id} className="w-full">
          <div 
             className={clsx(
                "flex items-center gap-4 py-3 px-4 hover:bg-slate-50 transition border-b border-slate-100",
                level === 0 ? "bg-slate-50/50" : ""
             )}
             style={{ paddingInlineStart: `${(level * 2) + 1}rem` }}
          >
             <div className="flex items-center gap-2 w-1/3">
                {hasChildren ? (
                   <button onClick={() => toggleNode(node.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-200 text-slate-500">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                   </button>
                ) : (
                   <div className="w-6 h-6" /> // spacer
                )}
                <div className="flex items-center gap-2">
                   <FolderTree className={clsx("w-4 h-4", level === 0 ? "text-primary-600" : "text-slate-400")} />
                   <span className={clsx("font-bold text-sm", level === 0 ? "text-slate-900" : "text-slate-700")}>{node.name}</span>
                   <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{node.id}</span>
                </div>
             </div>
             
             <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">المدير</span>
                   <span className="font-medium text-slate-700 flex items-center gap-1"><Users className="w-3 h-3 text-slate-400"/> {node.manager_name}</span>
                </div>
                <div className="flex flex-col text-end">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">التكلفة (Actual) / الموازنة</span>
                   <div className="font-mono font-bold text-slate-900" dir="ltr">
                      {new Intl.NumberFormat('ar-EG').format(node.actual_cost)} <span className="text-slate-400 font-normal">/ {new Intl.NumberFormat('ar-EG').format(node.budget)}</span>
                   </div>
                   <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div className={clsx("h-full", utilizationPercent > 90 ? "bg-rose-500" : "bg-emerald-500")} style={{ width: `${Math.min(utilizationPercent, 100)}%` }}></div>
                   </div>
                </div>
                <div className="flex flex-col text-end">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">الإيرادات (Revenue)</span>
                   <span className="font-mono font-bold text-primary-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(node.revenue)}</span>
                </div>
                <div className="flex flex-col text-end">
                   <span className="text-[10px] text-slate-500 font-bold uppercase">صافي الربح / (الخسارة)</span>
                   <span className={clsx("font-mono font-bold flex items-center justify-end gap-1", netProfit >= 0 ? "text-emerald-600" : "text-rose-600")} dir="ltr">
                      {netProfit >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">مراكز التكلفة (Cost Centers)</h2>
          <p className="text-slate-500 mt-1">إدارة الهيكل الشجري وتوزيع التكاليف وتحليل الأرباح والخسائر.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2"><Target className="w-5 h-5 text-primary-600" /> هيكل مراكز التكلفة (Cost Center Hierarchy)</h3>
         </div>
         <div className="flex flex-col w-full">
            {renderTree(costCentersTree)}
         </div>
      </div>
    </div>
  );
}
