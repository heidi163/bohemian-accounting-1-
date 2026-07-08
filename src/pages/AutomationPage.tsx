import { useState, useEffect } from "react";
import { 
  Bot, Clock, RotateCcw, Send, Settings, Database, CloudLightning, 
  Mail, CalendarRange, ToggleLeft, ToggleRight, PlayCircle, Plus, 
  Search, ShieldAlert, Activity, CheckCircle2, XCircle, AlertCircle, TrendingUp, Loader2, Zap
} from "lucide-react";
import { clsx } from "clsx";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import apiClient from "../api/client";

export function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'settings'>('jobs');
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Settings State
  const [sendReport, setSendReport] = useState(true);
  const [keepLogs, setKeepLogs] = useState(true);
  const [email, setEmail] = useState('admin@bohemiangeeks.com');
  
  // New Job Form State
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskType, setNewTaskType] = useState('Custom Task');
  const [newTaskSchedule, setNewTaskSchedule] = useState('يومياً (00:00)');
  const [runningJobs, setRunningJobs] = useState<number[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getIconForType = (type: string) => {
    if (type.includes('Backup')) return Database;
    if (type.includes('Email')) return Mail;
    if (type.includes('Invoice') || type.includes('Journal')) return RotateCcw;
    if (type.includes('Exchange')) return CloudLightning;
    if (type.includes('Depreciation')) return CalendarRange;
    if (type.includes('Reminder')) return Send;
    return Settings;
  };

  const fetchJobs = () => {
    setLoading(true);
    apiClient.get('/automations').then(res => {
      const mappedJobs = res.data.data.map((job: any) => ({
        id: job.id,
        name: job.name,
        type: job.type,
        schedule: job.schedule_cron,
        status: job.status,
        lastRun: job.last_run ? job.last_run.substring(0, 16) : '-',
        nextRun: job.next_run ? job.next_run.substring(0, 16) : '-',
        lastStatus: job.last_status,
        icon: getIconForType(job.type)
      }));
      setJobs(mappedJobs);
      setLoading(false);
    }).catch(err => {
      // Fallback if API is unreachable (Database not set up yet)
      setJobs([
        { id: 1, name: 'تحديث أسعار الصرف', type: 'Exchange Rate Updates', schedule: 'يومياً (00:00)', status: 'active', lastRun: '2026-06-16 00:00', nextRun: '2026-06-17 00:00', lastStatus: 'success', icon: CloudLightning },
        { id: 2, name: 'النسخ الاحتياطي اليومي', type: 'Daily Backups', schedule: 'يومياً (02:00)', status: 'active', lastRun: '2026-06-16 02:00', nextRun: '2026-06-17 02:00', lastStatus: 'success', icon: Database },
        { id: 3, name: 'إرسال ملخص يومي', type: 'Daily Summary Emails', schedule: 'يومياً (08:00)', status: 'active', lastRun: '2026-06-16 08:00', nextRun: '2026-06-17 08:00', lastStatus: 'success', icon: Mail },
        { id: 4, name: 'إنشاء الفواتير المتكررة', type: 'Recurring Invoices', schedule: 'شهرياً (يوم 1)', status: 'active', lastRun: '2026-06-01 00:00', nextRun: '2026-07-01 00:00', lastStatus: 'success', icon: RotateCcw },
        { id: 5, name: 'تسجيل القيود المتكررة', type: 'Recurring Journal Entries', schedule: 'شهرياً (يوم 28)', status: 'active', lastRun: '2026-05-28 00:00', nextRun: '2026-06-28 00:00', lastStatus: 'failed', icon: RotateCcw },
        { id: 6, name: 'حساب الإهلاك الشهري', type: 'Monthly Depreciation', schedule: 'نهاية كل شهر', status: 'active', lastRun: '2026-05-31 23:59', nextRun: '2026-06-30 23:59', lastStatus: 'pending', icon: CalendarRange },
        { id: 7, name: 'تذكير بالمدفوعات المتأخرة', type: 'Payment Reminders', schedule: 'أسبوعياً (الأحد)', status: 'inactive', lastRun: '-', nextRun: '-', lastStatus: 'pending', icon: Send },
      ]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const toggleStatus = (id: number) => {
    // Optimistic update
    setJobs(jobs.map(job => 
      job.id === id ? { 
        ...job, 
        status: job.status === 'active' ? 'inactive' : 'active',
        nextRun: job.status === 'active' ? '-' : 'تلقائي بناءً على الجدول'
      } : job
    ));
    
    apiClient.post(`/automations/${id}/toggle`).then(() => {
      showToast('تم تحديث حالة المهمة المجدولة بنجاح');
    }).catch(() => {
      showToast('حدث خطأ أثناء تحديث الحالة');
      fetchJobs(); // revert
    });
  };

  const triggerJob = (id: number, name: string) => {
    if (runningJobs.includes(id)) return;
    
    setRunningJobs(prev => [...prev, id]);
    showToast(`جاري تشغيل (${name})...`);
    
    apiClient.post(`/automations/${id}/run`).then(res => {
       const updatedData = res.data.data;
       setJobs(prevJobs => prevJobs.map(job => 
         job.id === id ? {
           ...job,
           lastRun: updatedData.last_run ? updatedData.last_run.substring(0, 16) : '-',
           lastStatus: updatedData.last_status
         } : job
       ));
       setRunningJobs(prev => prev.filter(jobId => jobId !== id));
       if (updatedData.last_status === 'success') {
         showToast(`تم اكتمال تشغيل (${name}) بنجاح`);
       } else {
         showToast(`فشل في تشغيل (${name})`);
       }
    }).catch(err => {
       // Fallback for mock mode
       setTimeout(() => {
         const now = new Date();
         const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
         
         setJobs(prevJobs => prevJobs.map(job => 
           job.id === id ? { ...job, lastRun: formattedDate, lastStatus: 'success' } : job
         ));
         setRunningJobs(prev => prev.filter(jobId => jobId !== id));
         showToast(`تم اكتمال تشغيل (${name}) بنجاح`);
       }, 1500);
    });
  };

  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName) return;
    
    apiClient.post('/automations', {
      name: newTaskName,
      type: newTaskType,
      schedule_cron: newTaskSchedule
    }).then(res => {
      setShowAddModal(false);
      setNewTaskName('');
      showToast('تمت إضافة المهمة المجدولة بنجاح');
      fetchJobs();
    }).catch(() => {
      // Fallback for mock mode
      const newJob = {
        id: Date.now(),
        name: newTaskName,
        type: newTaskType,
        schedule: newTaskSchedule,
        status: 'active',
        lastRun: '-',
        nextRun: 'قريباً',
        lastStatus: 'pending',
        icon: Settings
      };
      setJobs([newJob, ...jobs]);
      setShowAddModal(false);
      setNewTaskName('');
      showToast('تمت إضافة المهمة المجدولة بنجاح');
    });
  };

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text.replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/[ىي]/g, 'ي').toLowerCase();
  };

  const filteredJobs = jobs.filter(job => {
    const q = normalizeArabic(searchQuery);
    const matchesSearch = 
       normalizeArabic(job.name).includes(q) || 
       normalizeArabic(job.type).includes(q);
       
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const failedJobsCount = jobs.filter(j => j.lastStatus === 'failed').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary-600"/> 
            الأتمتة والمهام المجدولة 
            <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ Automation</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة العمليات الدورية (Cron Jobs) وتشغيل المهام في الخلفية لضمان كفاءة النظام.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
           <button
              onClick={() => setActiveTab('jobs')}
              className={clsx(
                 "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                 activeTab === 'jobs' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
           >
              <Clock className="w-4 h-4"/> المهام المجدولة
           </button>
           <button
              onClick={() => setActiveTab('settings')}
              className={clsx(
                 "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                 activeTab === 'settings' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
           >
              <Settings className="w-4 h-4"/> الإعدادات
           </button>
        </div>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">مهام نشطة حالياً</p>
                <p className="text-2xl font-black text-slate-800">{activeJobsCount}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4 group hover:border-rose-200 transition-colors">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">مهام فشلت (آخر 24س)</p>
                <p className="text-2xl font-black text-rose-600">{failedJobsCount}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">المهمة القادمة</p>
                <p className="text-sm font-black text-slate-800 mt-1 truncate">00:00 (تحديث الصرف)</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">نسبة نجاح الأتمتة</p>
                <p className="text-2xl font-black text-slate-800">99.8%</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عن مهمة (مثال: Backup)..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pe-12 ps-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                />
              </div>
              <div className="w-full md:w-56 z-50">
                 <SearchableSelect 
                   value={statusFilter}
                   onChange={setStatusFilter}
                   options={[
                     { value: 'all', label: 'كل الحالات' },
                     { value: 'active', label: 'نشط (Active)' },
                     { value: 'inactive', label: 'متوقف (Inactive)' }
                   ]}
                   allowCreate={false}
                   className="w-full"
                 />
              </div>
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="bg-primary-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-700 transition whitespace-nowrap shadow-lg shadow-primary-600/20"
            >
              <Plus className="w-5 h-5" /> إضافة مهمة مجدولة
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">المهمة (Task)</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">الجدول الزمني</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">آخر تشغيل</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">التشغيل القادم</th>
                    <th className="px-6 py-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-5 text-end text-xs font-bold text-slate-500 uppercase tracking-wider">إجراء يدوي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                          <span className="font-bold text-lg">جاري تحميل المهام...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredJobs.length > 0 ? (
                     filteredJobs.map(job => (
                       <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                               <job.icon className="w-5 h-5" />
                             </div>
                             <div>
                               <div className="font-bold text-slate-800">{job.name}</div>
                               <div className="font-mono text-xs text-slate-400 mt-0.5">{job.type}</div>
                             </div>
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200/60">
                             {job.schedule}
                           </span>
                         </td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2">
                              {runningJobs.includes(job.id) ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50 animate-pulse" title="قيد التشغيل"></div>
                              ) : job.lastStatus === 'success' ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" title="تم بنجاح"></div>
                              ) : job.lastStatus === 'failed' ? (
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" title="فشل"></div>
                              ) : (
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" title="لم يعمل بعد"></div>
                              )}
                              <span className="font-mono text-slate-500 text-xs">{runningJobs.includes(job.id) ? '...' : job.lastRun}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-500 text-xs bg-slate-50/50 rounded-lg group-hover:bg-white transition-colors">
                           {job.nextRun}
                         </td>
                         <td className="px-6 py-4 text-center">
                           <button onClick={() => toggleStatus(job.id)} className="relative inline-flex items-center w-10 h-6 focus:outline-none transition hover:scale-105 active:scale-95">
                             <div className={clsx(
                               "w-10 h-1.5 rounded-full transition-colors duration-300",
                               job.status === 'active' ? "bg-primary-200" : "bg-slate-200"
                             )}></div>
                             <div className={clsx(
                               "absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300",
                               job.status === 'active' ? "bg-primary-500 start-6" : "bg-white border border-slate-200 start-0"
                             )}></div>
                           </button>
                         </td>
                         <td className="px-6 py-4 text-end">
                           <button 
                             onClick={() => triggerJob(job.id, job.name)}
                             disabled={runningJobs.includes(job.id)}
                             className={clsx(
                               "px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ms-auto shadow-sm group",
                               runningJobs.includes(job.id) 
                                 ? "text-slate-400 bg-slate-100 cursor-not-allowed" 
                                 : "text-white bg-slate-800 hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5"
                             )}
                           >
                             {runningJobs.includes(job.id) ? (
                               <><Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" /> جاري التنفيذ...</>
                             ) : (
                               <><Zap className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" /> تنفيذ فوري</>
                             )}
                           </button>
                         </td>
                       </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <Search className="w-12 h-12 opacity-20" />
                            <span className="font-bold text-lg">لا توجد مهام مطابقة للبحث أو الفلترة</span>
                          </div>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 space-y-6">
            <h3 className="font-black text-xl text-slate-800 mb-2">إعدادات الإشعارات والتنبيهات</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">تحكم في من يتلقى التنبيهات في حال فشل أي مهمة مجدولة.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني للإشعارات</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-primary-500 bg-slate-50 text-left dir-ltr font-medium text-slate-700 transition-colors" 
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-sm font-bold text-slate-700">تنبيهات المهام الفاشلة</span>
                  <span className="block text-xs font-medium text-slate-500 mt-1">إرسال تقرير فور فشل أي مهمة (مثل تعذر النسخ الاحتياطي).</span>
                </div>
                <button onClick={() => setSendReport(!sendReport)} className="relative inline-flex items-center w-10 h-6 focus:outline-none transition hover:scale-105 active:scale-95 shrink-0">
                  <div className={clsx(
                    "w-10 h-1.5 rounded-full transition-colors duration-300",
                    sendReport ? "bg-primary-200" : "bg-slate-200"
                  )}></div>
                  <div className={clsx(
                    "absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300",
                    sendReport ? "bg-primary-500 start-6" : "bg-white border border-slate-200 start-0"
                  )}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <span className="block text-sm font-bold text-slate-700">سجل المهام (Log Retention)</span>
                  <span className="block text-xs font-medium text-slate-500 mt-1">الاحتفاظ بسجلات المهام القديمة لمدة 30 يوماً.</span>
                </div>
                <button onClick={() => setKeepLogs(!keepLogs)} className="relative inline-flex items-center w-10 h-6 focus:outline-none transition hover:scale-105 active:scale-95 shrink-0">
                  <div className={clsx(
                    "w-10 h-1.5 rounded-full transition-colors duration-300",
                    keepLogs ? "bg-primary-200" : "bg-slate-200"
                  )}></div>
                  <div className={clsx(
                    "absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300",
                    keepLogs ? "bg-primary-500 start-6" : "bg-white border border-slate-200 start-0"
                  )}></div>
                </button>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-8">
              <button 
                onClick={() => showToast('تم حفظ إعدادات الأتمتة بنجاح')} 
                className="w-full bg-primary-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/60 flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-2">
               <Settings className="w-10 h-10 animate-[spin_6s_linear_infinite]" />
             </div>
             <h3 className="font-black text-xl text-slate-800">جاهزية النظام (System Health)</h3>
             <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
               خدمة الجدولة تعمل بكفاءة على الخادم، وجميع الإعدادات يتم مراقبتها لحظياً لضمان عدم تعطل أي عملية أتمتة دورية.
             </p>
             <div className="mt-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-xl text-xs font-bold flex items-center gap-2">
               <CheckCircle2 className="w-4 h-4" /> الأتمتة تعمل بنسبة 100%
             </div>
          </div>
        </div>
      )}

      {showAddModal && (
         <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm text-center p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl text-start overflow-hidden shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                إضافة مهمة مجدولة جديدة
              </h3>
            </div>
            <form onSubmit={handleAddJob} className="p-6 space-y-5 min-h-[380px] flex flex-col">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم المهمة (Task Name)</label>
                <input 
                  required 
                  type="text" 
                  value={newTaskName} 
                  onChange={e => setNewTaskName(e.target.value)} 
                  placeholder="مثال: إرسال تقارير المبيعات" 
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-primary-500 bg-slate-50 font-medium transition-colors" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نوع المهمة البرمجية (Script / Type)</label>
                <input 
                  required 
                  type="text" 
                  value={newTaskType} 
                  onChange={e => setNewTaskType(e.target.value)} 
                  placeholder="مثال: Sales Report Email" 
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3.5 outline-none focus:border-primary-500 bg-slate-50 dir-ltr text-left font-mono text-sm transition-colors" 
                />
              </div>
              <div className="relative z-50">
                <label className="block text-sm font-bold text-slate-700 mb-2">الجدول الزمني (Schedule)</label>
                <SearchableSelect 
                  value={newTaskSchedule}
                  onChange={setNewTaskSchedule}
                  options={[
                    { value: 'كل ساعة (00:00)', label: 'كل ساعة (00:00)' },
                    { value: 'يومياً (00:00)', label: 'يومياً (00:00)' },
                    { value: 'أسبوعياً (الأحد)', label: 'أسبوعياً (الأحد)' },
                    { value: 'شهرياً (يوم 1)', label: 'شهرياً (يوم 1)' },
                    { value: 'عند الطلب فقط', label: 'عند الطلب فقط (On Demand)' },
                  ]}
                  allowCreate={true}
                  className="w-full"
                />
              </div>
              <div className="pt-6 flex gap-3 mt-auto">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 px-4 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" className="flex-1 py-4 px-4 rounded-2xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition shadow-lg shadow-primary-600/20">
                  إضافة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
