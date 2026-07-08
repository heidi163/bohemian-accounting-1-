import { useEffect, useState } from "react";
import { type AccountingPeriod } from "../types";
import { clsx } from "clsx";
import {
  Calendar, Lock, Unlock, CheckCircle, AlertTriangle, CheckSquare,
  Square, Save, RotateCcw, LayoutDashboard, Flag, ShieldCheck
} from "lucide-react";
import { getCompanyKey } from '../utils/storage';

const getMonthName = (month: number) => {
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  return months[month - 1] || `شهر ${month}`;
};

export function PeriodClosingPage() {
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<AccountingPeriod | null>(null);
  
  const showToast = (msg: string) => {
    window.dispatchEvent(new CustomEvent("show-toast", { detail: msg }));
  };

  const fetchPeriods = () => {
    fetch("/api/periods")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setPeriods(data.data))
      .catch(() => {
        const localPeriods = JSON.parse(localStorage.getItem(getCompanyKey('mock_periods')) || '[]');
        if (localPeriods.length > 0) {
          setPeriods(localPeriods);
        } else {
          // Initialize a full year of mock data if empty
          const defaults: AccountingPeriod[] = Array.from({ length: 12 }).map((_, i) => {
            const month = i + 1;
            let status: 'open' | 'soft_lock' | 'hard_lock' = 'open';
            if (month < 4) status = 'hard_lock';
            else if (month === 4) status = 'soft_lock';
            
            return {
              id: `2026-${month.toString().padStart(2, '0')}`,
              month,
              year: 2026,
              status,
              checklists: [
                { id: "t1", name: "مراجعة وتسوية قيود اليومية", isCompleted: status !== 'open', requiredForHardLock: true },
                { id: "t2", name: "تسوية الحسابات البنكية", isCompleted: status !== 'open', requiredForHardLock: true },
                { id: "t3", name: "تسويات الاستحقاق والتأجيل (Accruals & Deferrals)", isCompleted: status === 'hard_lock', requiredForHardLock: true },
                { id: "t4", name: "تسجيل إهلاك الأصول الثابتة (IAS 16)", isCompleted: status === 'hard_lock', requiredForHardLock: false },
                { id: "t5", name: "احتساب الرواتب والضرائب", isCompleted: status !== 'open', requiredForHardLock: true },
                { id: "t6", name: "مراجعة الذمم ومخصص الديون المشكوك فيها (IFRS 9)", isCompleted: status === 'hard_lock', requiredForHardLock: true },
                { id: "t7", name: "إعادة تقييم فروق العملات الأجنبية (IAS 21)", isCompleted: status === 'hard_lock', requiredForHardLock: true },
                { id: "t8", name: "مراجعة القوائم المالية الشهرية", isCompleted: status === 'hard_lock', requiredForHardLock: true }
              ]
            };
          });
          localStorage.setItem(getCompanyKey('mock_periods'), JSON.stringify(defaults));
          setPeriods(defaults);
        }
      });
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const toggleChecklist = async (taskId: string) => {
    if (!activePeriod) return;
    if (activePeriod.status === 'hard_lock') {
      showToast("لا يمكن التعديل: الفترة مغلقة نهائياً ");
      return;
    }
    const updated = { ...activePeriod };
    const task = updated.checklists.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      setActivePeriod(updated);
      
      const localPeriods = JSON.parse(localStorage.getItem(getCompanyKey('mock_periods')) || '[]');
      const updatedPeriods = localPeriods.map((p: any) => p.id === activePeriod.id ? updated : p);
      localStorage.setItem(getCompanyKey('mock_periods'), JSON.stringify(updatedPeriods));
      setPeriods(updatedPeriods);
    }
  };

  const updatePeriodStatus = async (status: 'open' | 'soft_lock' | 'hard_lock') => {
    if (!activePeriod) return;
    
    // Check prerequisites for hard lock
    if (status === 'hard_lock' && activePeriod.checklists.some(c => c.requiredForHardLock && !c.isCompleted)) {
      showToast("️ يجب إكمال جميع المهام الأساسية أولاً");
      return;
    }

    const updated = { ...activePeriod, status };
    const localPeriods = JSON.parse(localStorage.getItem(getCompanyKey('mock_periods')) || '[]');
    const updatedPeriods = localPeriods.map((p: any) => p.id === activePeriod.id ? updated : p);
    localStorage.setItem(getCompanyKey('mock_periods'), JSON.stringify(updatedPeriods));
    
    setPeriods(updatedPeriods);
    setActivePeriod(updated);
    showToast(`تم تغيير حالة الشهر إلى: ${status === 'hard_lock' ? 'إقفال نهائي' : status === 'soft_lock' ? 'إقفال مبدئي' : 'مفتوح'}`);
  };

  // Metrics
  const openCount = periods.filter(p => p.status === 'open').length;
  const softCount = periods.filter(p => p.status === 'soft_lock').length;
  const hardCount = periods.filter(p => p.status === 'hard_lock').length;
  const progressPercent = Math.round((hardCount / 12) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2">
             <Calendar className="w-7 h-7 text-primary-600"/> إغلاق الفترات (Period Closing)
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">التحكم في قفل الفترات المالية، والتأكد من إتمام المهام المحاسبية قبل ترحيل الأرصدة.</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>الفترات المفتوحة</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><Unlock className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">{openCount}</div>
            <div className="text-xs font-bold text-primary-600 mt-2 bg-primary-50 inline-block px-2 py-1 rounded-lg">شهور قيد العمل</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إقفال مبدئي (Soft)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Lock className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">{softCount}</div>
            <div className="text-xs font-bold text-amber-600 mt-2 bg-amber-50 inline-block px-2 py-1 rounded-lg">بانتظار المراجعة</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إقفال نهائي (Hard)</span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700"><ShieldCheck className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight" dir="ltr">{hardCount}</div>
            <div className="text-xs font-bold text-slate-600 mt-2 bg-slate-100 inline-block px-2 py-1 rounded-lg">مقفلة تماماً</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>تقدم العام (2026)</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><Flag className="w-4 h-4"/></div>
          </div>
          <div>
            <div className="flex items-end gap-2">
               <div className="text-3xl font-black text-primary-600 tracking-tight" dir="ltr">{progressPercent}%</div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
               <div className="h-full bg-primary-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Sidebar: Periods List */}
         <div className="lg:col-span-1 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden flex flex-col max-h-[800px]">
            <div className="p-5 border-b border-slate-50 bg-slate-50/50">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-primary-600"/> السنة المالية 2026
               </h3>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto custom-scrollbar">
               {periods.map(period => (
                  <div 
                     key={period.id} 
                     onClick={() => setActivePeriod(period)}
                     className={clsx(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                        activePeriod?.id === period.id 
                           ? "bg-primary-50/50 border-primary-200 shadow-sm" 
                           : "bg-white border-slate-100 hover:border-primary-200 hover:bg-slate-50"
                     )}
                  >
                     <div className="flex items-center gap-3">
                        <div className={clsx(
                           "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-colors",
                           activePeriod?.id === period.id ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-primary-100 group-hover:text-primary-600"
                        )}>
                           {period.month}
                        </div>
                        <div>
                           <div className="font-bold text-slate-800">{getMonthName(period.month)}</div>
                           <div className="text-[10px] font-mono text-slate-400 tracking-wider mt-0.5">{period.id}</div>
                        </div>
                     </div>
                     <div>
                        {period.status === 'open' ? (
                           <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center" title="مفتوح"><Unlock className="w-4 h-4"/></div>
                        ) : period.status === 'soft_lock' ? (
                           <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center" title="إقفال مبدئي"><Lock className="w-4 h-4"/></div>
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center" title="إقفال نهائي"><ShieldCheck className="w-4 h-4"/></div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Main Panel: Active Period Control */}
         <div className="lg:col-span-2">
            {!activePeriod ? (
               <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 h-full flex flex-col items-center justify-center text-slate-400 p-12 text-center min-h-[500px]">
                  <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                     <Calendar className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-700">اختر فترة محاسبية</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">قم باختيار أحد الشهور من القائمة الجانبية لعرض قائمة مهام الإغلاق والتحكم في حالة الفترة.</p>
               </div>
            ) : (
               <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden flex flex-col h-full">
                  
                  {/* Status Banner */}
                  <div className={clsx(
                     "px-8 py-6 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors",
                     activePeriod.status === 'hard_lock' ? "bg-slate-800 border-slate-800 text-white" :
                     activePeriod.status === 'soft_lock' ? "bg-amber-50 border-amber-100" :
                     "bg-primary-50 border-primary-100"
                  )}>
                     <div>
                        <h3 className={clsx("font-black text-3xl", activePeriod.status === 'hard_lock' ? "text-white" : "text-slate-900")}>
                           إغلاق شهر {getMonthName(activePeriod.month)}
                        </h3>
                        <p className={clsx("text-sm mt-2 font-medium opacity-80", activePeriod.status === 'hard_lock' && "text-slate-300")}>
                           {activePeriod.status === 'hard_lock' 
                              ? "تم الإقفال النهائي بنجاح. لا يمكن إجراء أي تعديلات مالية على هذا الشهر."
                              : "يجب إتمام كافة خطوات المراجعة في القائمة أدناه قبل الإغلاق النهائي."}
                        </p>
                     </div>
                     <div className="text-center bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/10 shrink-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">الحالة الحالية</div>
                        <div className="font-black text-xl flex items-center gap-2">
                           {activePeriod.status === 'hard_lock' ? <><ShieldCheck className="w-5 h-5"/> إقفال نهائي</> :
                            activePeriod.status === 'soft_lock' ? <><Lock className="w-5 h-5"/> إقفال مبدئي</> :
                            <><Unlock className="w-5 h-5"/> فترة مفتوحة</>}
                        </div>
                     </div>
                  </div>

                  {/* Checklist */}
                  <div className="p-8 flex-1 space-y-6">
                     <div>
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4 text-lg">
                           <CheckCircle className="w-5 h-5 text-primary-600" /> قائمة التحقق للإغلاق
                        </h4>
                        <div className="space-y-3">
                           {activePeriod.checklists.map(task => (
                              <div 
                                 key={task.id}
                                 onClick={() => toggleChecklist(task.id)}
                                 className={clsx(
                                    "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                    activePeriod.status === 'hard_lock' 
                                       ? "bg-slate-50 border-slate-100 cursor-default opacity-80" 
                                       : "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm border-slate-200 bg-white",
                                    task.isCompleted && activePeriod.status !== 'hard_lock' ? "border-primary-200 bg-primary-50/30" : ""
                                 )}
                              >
                                 <div className={clsx(
                                    "w-6 h-6 rounded-md flex items-center justify-center border-2 transition-colors shrink-0",
                                    task.isCompleted 
                                       ? "bg-primary-500 border-primary-500 text-white" 
                                       : "border-slate-300 text-transparent"
                                 )}>
                                    <CheckSquare className="w-4 h-4 stroke-[3]" />
                                 </div>
                                 <div className="flex-1">
                                    <div className={clsx("font-bold text-sm", task.isCompleted ? "text-slate-900" : "text-slate-700")}>{task.name}</div>
                                    {task.requiredForHardLock && !task.isCompleted && (
                                       <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1 bg-amber-50 px-2 py-0.5 rounded inline-block">مطلوب للإغلاق النهائي</div>
                                    )}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Warning for uncompleted tasks */}
                     {activePeriod.status !== 'hard_lock' && activePeriod.checklists.some(c => c.requiredForHardLock && !c.isCompleted) && (
                        <div className="flex items-start gap-3 p-5 rounded-2xl border border-rose-100 bg-rose-50 text-rose-800 animate-in fade-in slide-in-from-bottom-2">
                           <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                           <div className="text-sm font-bold leading-relaxed">تنبيه: لا يمكنك تطبيق "الإقفال النهائي" حتى تكتمل جميع المهام الأساسية (المحددة بعلامة برتقالية).</div>
                        </div>
                     )}
                  </div>

                  {/* Action Buttons */}
                  <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex flex-wrap gap-4">
                     <button 
                        onClick={() => updatePeriodStatus('open')}
                        disabled={activePeriod.status === 'open'}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-white border-2 border-primary-100 text-primary-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
                     >
                        <Unlock className="w-4 h-4"/> إعادة فتح الفترة
                     </button>
                     <button 
                        onClick={() => updatePeriodStatus('soft_lock')}
                        disabled={activePeriod.status === 'soft_lock'}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
                     >
                        <Lock className="w-4 h-4"/> إقفال مبدئي (مؤقت)
                     </button>
                     <button 
                        onClick={() => updatePeriodStatus('hard_lock')}
                        disabled={activePeriod.status === 'hard_lock' || activePeriod.checklists.some(c => c.requiredForHardLock && !c.isCompleted)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow"
                     >
                        <ShieldCheck className="w-4 h-4"/> إقفال نهائي ومُحكم
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>

      
    </div>
  );
}
