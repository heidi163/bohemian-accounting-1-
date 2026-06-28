import { useState } from "react";
import { 
  Bot, Clock, RotateCcw, Send, Settings, Database, CloudLightning, 
  Mail, CalendarRange, ToggleLeft, ToggleRight, PlayCircle
} from "lucide-react";
import { clsx } from "clsx";

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'settings'>('jobs');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Settings State
  const [sendReport, setSendReport] = useState(true);
  const [keepLogs, setKeepLogs] = useState(true);
  const [email, setEmail] = useState('admin@bohemiangeeks.com');
  
  // New Job Form State
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState('Custom Task');
  const [newTaskSchedule, setNewTaskSchedule] = useState('يومياً (00:00)');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };
  
  const [jobs, setJobs] = useState([
    { id: 1, name: 'تحديث أسعار الصرف', type: 'Exchange Rate Updates', schedule: 'يومياً (00:00)', status: 'active', lastRun: '2026-06-16 00:00', icon: CloudLightning },
    { id: 2, name: 'النسخ الاحتياطي اليومي', type: 'Daily Backups', schedule: 'يومياً (02:00)', status: 'active', lastRun: '2026-06-16 02:00', icon: Database },
    { id: 3, name: 'إرسال ملخص يومي', type: 'Daily Summary Emails', schedule: 'يومياً (08:00)', status: 'active', lastRun: '2026-06-16 08:00', icon: Mail },
    { id: 4, name: 'إنشاء الفواتير المتكررة', type: 'Recurring Invoices', schedule: 'شهرياً (يوم 1)', status: 'active', lastRun: '2026-06-01 00:00', icon: RotateCcw },
    { id: 5, name: 'تسجيل القيود المتكررة', type: 'Recurring Journal Entries', schedule: 'شهرياً (يوم 28)', status: 'active', lastRun: '2026-05-28 00:00', icon: RotateCcw },
    { id: 6, name: 'حساب الإهلاك الشهري', type: 'Monthly Depreciation', schedule: 'نهاية كل شهر', status: 'active', lastRun: '2026-05-31 23:59', icon: CalendarRange },
    { id: 7, name: 'تذكير بالمدفوعات المتأخرة', type: 'Payment Reminders', schedule: 'أسبوعياً (الأحد)', status: 'inactive', lastRun: '-', icon: Send },
  ]);

  const toggleStatus = (id: number) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, status: job.status === 'active' ? 'inactive' : 'active' } : job
    ));
    showToast('تم تحديث حالة المهمة المجدولة بنجاح');
  };

  const triggerJob = (name: string) => {
    showToast(`تم تشغيل ${name} يدوياً بنجاح`);
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName) return;
    
    const newJob = {
      id: Date.now(),
      name: newTaskName,
      type: newTaskType,
      schedule: newTaskSchedule,
      status: 'active',
      lastRun: '-',
      icon: Settings
    };
    
    setJobs([newJob, ...jobs]);
    setShowAddModal(false);
    setNewTaskName('');
    showToast('تمت إضافة المهمة المجدولة بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><Bot className="w-7 h-7 text-primary-600"/> الأتمتة والمهام المجدولة (Automation)</h2>
          <p className="text-slate-500 mt-1">إدارة المهام التلقائية (Cron Jobs)، التنبيهات، والعمليات الدورية.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
              onClick={() => setActiveTab('jobs')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'jobs' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <Clock className="w-4 h-4"/> المهام المجدولة
           </button>
           <button
              onClick={() => setActiveTab('settings')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'settings' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <Settings className="w-4 h-4"/> إعدادات الأتمتة
           </button>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">قائمة المهام التلقائية (Cron Jobs)</h3>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="bg-primary-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition text-sm"
            >
              + إضافة مهمة مجدولة
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">المهمة (Task)</th>
                  <th className="px-6 py-4 text-start">النوع (Type)</th>
                  <th className="px-6 py-4 text-start">الجدول الزمني (Schedule)</th>
                  <th className="px-6 py-4 text-start">آخر تشغيل (Last Run)</th>
                  <th className="px-6 py-4 text-center">التفعيل</th>
                  <th className="px-6 py-4 text-end">إجراء يدوي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-primary-600">
                        <job.icon className="w-4 h-4" />
                      </div>
                      {job.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{job.type}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-xs font-bold">{job.schedule}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{job.lastRun}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleStatus(job.id)} className="text-slate-400 hover:text-primary-600 transition">
                        {job.status === 'active' ? (
                          <ToggleRight className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-end">
                      <button 
                        onClick={() => triggerJob(job.name)}
                        className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ms-auto"
                      >
                        <PlayCircle className="w-4 h-4" /> تشغيل الآن
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-slate-500 text-sm">إعدادات متقدمة للتحكم في قواعد الأتمتة وصلاحيات إرسال التنبيهات.</p>
          <div className="mt-6 space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني للإشعارات</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 bg-slate-50 text-left dir-ltr" />
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setSendReport(!sendReport)} className="text-slate-400 hover:text-primary-600 transition">
                {sendReport ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
              </button>
              <span className="text-sm font-bold text-slate-700 cursor-pointer select-none" onClick={() => setSendReport(!sendReport)}>إرسال تقرير بالمهام الفاشلة فوراً</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setKeepLogs(!keepLogs)} className="text-slate-400 hover:text-primary-600 transition">
                {keepLogs ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8 text-slate-300" />}
              </button>
              <span className="text-sm font-bold text-slate-700 cursor-pointer select-none" onClick={() => setKeepLogs(!keepLogs)}>الاحتفاظ بسجلات المهام لمدة 30 يوماً</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-6">
            <button onClick={() => showToast('تم حفظ إعدادات الأتمتة بنجاح ')} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-primary-700 transition">حفظ التغييرات</button>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">إضافة مهمة مجدولة جديدة</h3>
            </div>
            <form onSubmit={handleAddJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم المهمة</label>
                <input required type="text" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} placeholder="مثال: إرسال تقارير المبيعات" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">نوع المهمة (البرمجية)</label>
                <input required type="text" value={newTaskType} onChange={e => setNewTaskType(e.target.value)} placeholder="مثال: Sales Report Email" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50 dir-ltr text-left" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الجدول الزمني (Cron)</label>
                <select value={newTaskSchedule} onChange={e => setNewTaskSchedule(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50 font-bold">
                  <option value="كل ساعة (00:00)">كل ساعة (00:00)</option>
                  <option value="يومياً (00:00)">يومياً (00:00)</option>
                  <option value="أسبوعياً (الأحد)">أسبوعياً (الأحد)</option>
                  <option value="شهرياً (يوم 1)">شهرياً (يوم 1)</option>
                  <option value="عند الطلب فقط">عند الطلب فقط (On Demand)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition">
                  إضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
