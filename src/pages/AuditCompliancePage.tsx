import { useState } from "react";
import { 
  ShieldCheck, History, Search, Download, Lock, Server, 
  AlertTriangle, CheckCircle2, XCircle, Users, Activity,
  Database, ShieldAlert
} from "lucide-react";
import { clsx } from "clsx";
import { SearchableSelect } from "../components/ui/SearchableSelect";

export function AuditCompliancePage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'security'>('audit');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showRetentionModal, setShowRetentionModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const logs = [
    { id: 1, action: 'تسجيل دخول', user: 'أحمد محمود', ip: '192.168.1.1', date: '2026-06-16 10:00 AM', status: 'نجاح', type: 'Logins' },
    { id: 2, action: 'إنشاء قيد يومية', user: 'سارة خالد', ip: '192.168.1.5', date: '2026-06-16 09:30 AM', status: 'نجاح', type: 'Create Logs' },
    { id: 3, action: 'تعديل فاتورة #1024', user: 'أحمد محمود', ip: '192.168.1.1', date: '2026-06-15 02:15 PM', status: 'نجاح', type: 'Update Logs' },
    { id: 4, action: 'حذف سجل موظف', user: 'مدير النظام', ip: '192.168.1.10', date: '2026-06-15 11:45 AM', status: 'تحذير', type: 'Delete Logs' },
    { id: 5, action: 'اعتماد مصروفات', user: 'مدير النظام', ip: '192.168.1.10', date: '2026-06-14 04:20 PM', status: 'نجاح', type: 'Approvals' },
    { id: 6, action: 'تسجيل دخول (كلمة مرور خاطئة)', user: 'مجهول', ip: '45.12.33.1', date: '2026-06-14 03:00 AM', status: 'فشل', type: 'Logins' },
  ];

  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));
  const uniqueTypes = Array.from(new Set(logs.map(l => l.type)));

  const normalizeArabic = (text: string) => {
    if (!text) return '';
    return text.replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/[ىي]/g, 'ي').toLowerCase();
  };

  const filteredLogs = logs.filter(log => {
    const q = normalizeArabic(searchQuery);
    const matchesSearch = 
       normalizeArabic(log.action).includes(q) || 
       normalizeArabic(log.user).includes(q) || 
       normalizeArabic(log.ip).includes(q) || 
       normalizeArabic(log.type).includes(q);
       
    const matchesUser = userFilter === 'all' || log.user === userFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    
    return matchesSearch && matchesUser && matchesType;
  });

  const handleExport = () => {
    const headers = ["ID", "Action", "Type", "User", "IP Address", "Date", "Status"];
    const htmlContent = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <table border="1">
            <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            ${filteredLogs.map(l => `
              <tr>
                <td>${l.id}</td>
                <td>${l.action}</td>
                <td>${l.type}</td>
                <td>${l.user}</td>
                <td>${l.ip}</td>
                <td>${l.date}</td>
                <td>${l.status}</td>
              </tr>
            `).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('تم تصدير سجل التدقيق بنجاح بصيغة XLS');
  };

  const handleSecurityScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          showToast('تم فحص النظام بنجاح 100%: جميع البروتوكولات والتشفير تعمل بأمان تام ولم يتم اكتشاف أي ثغرات.');
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Logins': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Create Logs': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Update Logs': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Delete Logs': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Approvals': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary-600"/> 
            التدقيق والامتثال 
            <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ Audit & Compliance</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">سجل النشاطات، اكتشاف التلاعب، الامتثال للمعايير والاحتفاظ بالسجلات لمدة 10 سنوات.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
           <button
              onClick={() => setActiveTab('audit')}
              className={clsx(
                 "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                 activeTab === 'audit' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
           >
              <History className="w-4 h-4"/> سجل التدقيق
           </button>
           <button
              onClick={() => setActiveTab('security')}
              className={clsx(
                 "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
                 activeTab === 'security' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              )}
           >
              <Lock className="w-4 h-4"/> الأمان
           </button>
        </div>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">إجمالي السجلات</p>
                <p className="text-2xl font-black text-slate-800">1,245</p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center gap-4 group hover:border-rose-200 transition-colors">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-rose-100 transition-colors">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">دخول فاشل (اختراق)</p>
                <p className="text-2xl font-black text-rose-600">3</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center gap-4 group hover:border-amber-200 transition-colors">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">تحذيرات أمنية</p>
                <p className="text-2xl font-black text-amber-600">12</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">مستخدمين نشطين</p>
                <p className="text-2xl font-black text-slate-800">8</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:max-w-3xl">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث عام (إجراء، IP)..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pe-12 ps-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                />
              </div>
              <div className="w-full md:w-48">
                 <SearchableSelect 
                   value={userFilter}
                   onChange={setUserFilter}
                   options={[
                     { value: 'all', label: 'كل المستخدمين' },
                     ...uniqueUsers.map(u => ({ value: u, label: u }))
                   ]}
                   allowCreate={false}
                   className="w-full"
                 />
              </div>
              <div className="w-full md:w-48">
                 <SearchableSelect 
                   value={typeFilter}
                   onChange={setTypeFilter}
                   options={[
                     { value: 'all', label: 'كل الإجراءات' },
                     ...uniqueTypes.map(t => ({ value: t, label: t }))
                   ]}
                   allowCreate={false}
                   className="w-full"
                 />
              </div>
            </div>
            <button 
              onClick={handleExport} 
              className="bg-primary-50 text-primary-700 font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-100 transition whitespace-nowrap"
            >
              <Download className="w-5 h-5" /> تصدير السجل
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">المستخدم</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">الإجراء (Action)</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">عنوان الـ IP</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">التاريخ والوقت</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.length > 0 ? (
                     filteredLogs.map(log => (
                       <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                         <td className="px-6 py-4 font-bold text-slate-600">{log.user}</td>
                         <td className="px-6 py-4">
                           <span className="font-bold text-slate-800">{log.action}</span>
                         </td>
                         <td className="px-6 py-4">
                           <span className={clsx("px-3 py-1.5 rounded-lg text-xs font-bold border", getTypeStyle(log.type))}>
                             {log.type}
                           </span>
                         </td>
                         <td className="px-6 py-4 font-mono text-slate-500 text-sm bg-slate-50/50 rounded-lg group-hover:bg-white transition-colors">{log.ip}</td>
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                             <History className="w-4 h-4 text-slate-400" />
                             {log.date}
                           </div>
                         </td>
                         <td className="px-6 py-4">
                           <div className={clsx(
                             "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold",
                             log.status === 'نجاح' ? "bg-emerald-50 text-emerald-600" : 
                             log.status === 'تحذير' ? "bg-amber-50 text-amber-600" : 
                             "bg-rose-50 text-rose-600"
                           )}>
                             {log.status === 'نجاح' && <CheckCircle2 className="w-4 h-4" />}
                             {log.status === 'تحذير' && <AlertTriangle className="w-4 h-4" />}
                             {log.status === 'فشل' && <XCircle className="w-4 h-4" />}
                             {log.status}
                           </div>
                         </td>
                       </tr>
                     ))
                  ) : (
                     <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                            <Search className="w-12 h-12 opacity-20" />
                            <span className="font-bold text-lg">لا توجد سجلات مطابقة للبحث أو الفلترة</span>
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

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 end-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Lock className="w-48 h-48" />
            </div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center relative z-10">
              <Lock className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-2xl text-slate-800 mb-3">تشفير وحماية البيانات</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-6 font-medium">
                يتم تشفير جميع البيانات أثناء النقل باستخدام بروتوكول <strong className="text-slate-700">HTTPS (TLS 1.3)</strong>. كما يتم الالتزام بمعايير <strong className="text-slate-700">OWASP Compliance</strong> للحماية من الثغرات الأمنية مثل الاختراقات والهجمات.
              </p>
              <button 
                onClick={handleSecurityScan} 
                disabled={isScanning} 
                className="w-full relative py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition overflow-hidden shadow-sm"
              >
                {isScanning ? (
                   <>
                     <div className="absolute top-0 start-0 bottom-0 bg-primary-100/50" style={{ width: `${scanProgress}%`, transition: 'width 0.2s' }}></div>
                     <span className="relative z-10 text-primary-700 flex items-center justify-center gap-2">
                       <Activity className="w-5 h-5 animate-pulse" />
                       جاري الفحص... {scanProgress}%
                     </span>
                   </>
                ) : "فحص الأمان المباشر (Security Scan)"}
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 end-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
              <Server className="w-48 h-48" />
            </div>
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center relative z-10">
              <Server className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <h3 className="font-black text-2xl text-slate-800 mb-3">الاحتفاظ بالبيانات (Retention)</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-6 font-medium">
                يتم الاحتفاظ بجميع سجلات التدقيق والعمليات المالية لمدة <strong className="text-primary-600">10 سنوات (10 Years Retention)</strong> تلقائياً، مع نسخ احتياطي دوري لضمان عدم فقدان أي بيانات تاريخية قانونية.
              </p>
              <button 
                onClick={() => setShowRetentionModal(true)} 
                className="w-full py-4 bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition shadow-sm"
              >
                مراجعة سياسة الاحتفاظ وتفاصيل النسخ
              </button>
            </div>
          </div>
        </div>
      )}

      {showRetentionModal && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm text-center p-4 sm:p-0 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl text-start overflow-hidden shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <Server className="w-5 h-5" />
                    </div>
                    سياسة الاحتفاظ بالبيانات
                  </h3>
               </div>
               <div className="p-6 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                     <span className="text-slate-600 font-bold text-sm">النسخ الاحتياطي التلقائي:</span>
                     <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-black">مفعل 100%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                     <span className="text-slate-600 font-bold text-sm">مدة الاحتفاظ بالسجلات:</span>
                     <span className="font-mono font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-lg">10 Years</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                     <span className="text-slate-600 font-bold text-sm">آخر نسخة احتياطية:</span>
                     <span className="font-mono text-slate-500 text-sm font-bold bg-slate-50 px-3 py-1 rounded-lg">{new Date().toLocaleString('ar-EG')}</span>
                  </div>
                  <button 
                    onClick={() => setShowRetentionModal(false)} 
                    className="w-full py-4 mt-2 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                  >
                     حسناً، إغلاق
                  </button>
               </div>
            </div>
         </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
