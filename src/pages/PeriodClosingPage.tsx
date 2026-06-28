import { useEffect, useState } from "react";
import { type AccountingPeriod } from "../types";
import { clsx } from "clsx";
import { Calendar, Lock, Unlock, CheckCircle, AlertTriangle, CheckSquare, Square, Save, RotateCcw } from "lucide-react";

export function PeriodClosingPage() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<AccountingPeriod | null>(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchPeriods = () => {
    fetch("/api/periods")
      .then((res) => res.json())
      .then((data) => setPeriods(data.data));
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const toggleChecklist = async (taskId: string) => {
    if (!activePeriod) return;
    const updated = { ...activePeriod };
    const task = updated.checklists.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      setActivePeriod(updated);
      
      try {
        await fetch("/api/periods/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodId: activePeriod.id, taskId, isCompleted: task.isCompleted })
        });
        fetchPeriods(); // refresh state
      } catch(e) { console.error(e); }
    }
  };

  const updatePeriodStatus = async (status: 'open' | 'soft_lock' | 'hard_lock') => {
    if (!activePeriod) return;
    try {
      const res = await fetch("/api/periods/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activePeriod.id, status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
        setPeriods(data.data);
        setActivePeriod(data.data.find((p: any) => p.id === activePeriod.id));
      } else {
        showToast("خطأ: " + data.message);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><Calendar className="w-7 h-7 text-primary-600"/> إغلاق الفترات (Period Closing)</h2>
          <p className="text-slate-500 mt-1">التحكم في إغلاق الأشهر والسنوات المالية، وقوائم التحقق للحفاظ على سلامة البيانات.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Periods List */}
         <div className="lg:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 px-2">الفترات المحاسبية (2026)</h3>
            {periods.map(period => (
               <div 
                  key={period.id} 
                  onClick={() => setActivePeriod(period)}
                  className={clsx(
                     "p-4 rounded-xl border transition cursor-pointer flex items-center justify-between",
                     activePeriod?.id === period.id ? "bg-primary-50 border-primary-200 shadow-sm" : "bg-white border-slate-200 hover:border-primary-300"
                  )}
               >
                  <div>
                     <div className="font-bold text-slate-800 text-lg">شهر {period.month}</div>
                     <div className="text-xs text-slate-500 font-mono mt-0.5">{period.id}</div>
                  </div>
                  <div>
                     {period.status === 'open' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                           <Unlock className="w-3 h-3"/> مفتوح (Open)
                        </span>
                     ) : period.status === 'soft_lock' ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                           <Lock className="w-3 h-3"/> قفل جزئي (Soft Lock)
                        </span>
                     ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                           <Lock className="w-3 h-3"/> مغلق (Hard Lock)
                        </span>
                     )}
                  </div>
               </div>
            ))}
         </div>

         {/* Active Period Control Panel */}
         <div className="lg:col-span-2">
            {!activePeriod ? (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                  <Lock className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-bold text-lg">اختر فترة محاسبية من القائمة</p>
                  <p className="text-sm mt-2">لعرض قوائم التحقق وتغيير حالة الإغلاق.</p>
               </div>
            ) : (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                     <div>
                        <h3 className="font-bold text-2xl text-slate-800">إغلاق شهر {activePeriod.month} ({activePeriod.year})</h3>
                        <p className="text-sm text-slate-500 mt-1">يجب إتمام كافة خطوات التحقق قبل الإغلاق النهائي (Hard Lock).</p>
                     </div>
                     <div className="text-end">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">الحالة الحالية</div>
                        <div className="font-bold text-lg text-slate-900 capitalize">{activePeriod.status.replace('_', ' ')}</div>
                     </div>
                  </div>

                  <div className="p-6 flex-1 space-y-6">
                     <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                           <CheckCircle className="w-5 h-5 text-primary-600" /> قائمة التحقق للإغلاق (Closing Checklist)
                        </h4>
                        <div className="space-y-3">
                           {activePeriod.checklists.map(task => (
                              <div 
                                 key={task.id}
                                 onClick={() => activePeriod.status !== 'hard_lock' && toggleChecklist(task.id)}
                                 className={clsx(
                                    "flex items-center gap-3 p-3 rounded-xl border transition",
                                    activePeriod.status === 'hard_lock' ? "bg-slate-50 border-slate-100 cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-slate-50 border-slate-200",
                                    task.isCompleted ? "bg-emerald-50/50 border-emerald-100" : ""
                                 )}
                              >
                                 {task.isCompleted ? <CheckSquare className="w-5 h-5 text-emerald-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                                 <div className="flex-1">
                                    <div className={clsx("font-bold text-sm", task.isCompleted ? "text-emerald-900" : "text-slate-700")}>{task.name}</div>
                                    {task.requiredForHardLock && <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">مطلوب للإغلاق النهائي</div>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {activePeriod.status !== 'hard_lock' && activePeriod.checklists.some(c => c.requiredForHardLock && !c.isCompleted) && (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-100 bg-rose-50 text-rose-800">
                           <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                           <div className="text-sm font-medium">لا يمكنك تطبيق الإغلاق النهائي (Hard Lock) حتى تكتمل جميع المهام المطلوبة في قائمة التحقق.</div>
                        </div>
                     )}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3">
                     <button 
                        onClick={() => updatePeriodStatus('open')}
                        disabled={activePeriod.status === 'open'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                     >
                        <Unlock className="w-4 h-4"/> فتح الفترة (Open)
                     </button>
                     <button 
                        onClick={() => updatePeriodStatus('soft_lock')}
                        disabled={activePeriod.status === 'soft_lock'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                     >
                        <Lock className="w-4 h-4"/> قفل جزئي (Soft Lock)
                     </button>
                     <button 
                        onClick={() => updatePeriodStatus('hard_lock')}
                        disabled={activePeriod.status === 'hard_lock' || activePeriod.checklists.some(c => c.requiredForHardLock && !c.isCompleted)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                     >
                        <Lock className="w-4 h-4"/> إغلاق نهائي (Hard Lock)
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
