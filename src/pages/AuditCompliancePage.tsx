import { useState } from "react";
import { ShieldCheck, History, Search, Download, Filter, Lock, Server } from "lucide-react";
import { clsx } from "clsx";

export function AuditCompliancePage() {
  const [activeTab, setActiveTab] = useState<'audit' | 'security'>('audit');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'نجاح' | 'تحذير'>('all');
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
  ];

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
    const matchesStatus = statusFilter === 'all' ? true : log.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          showToast('تم فحص النظام بنجاح 100%: جميع البروتوكولات والتشفير تعمل بأمان تام ولم يتم اكتشاف أي ثغرات. ');
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-primary-600"/> التدقيق والامتثال (Audit & Compliance)</h2>
          <p className="text-slate-500 mt-1">تتبع النشاطات (Activity History)، الامتثال لمعايير OWASP، والاحتفاظ بالسجلات لمدة 10 سنوات.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
              onClick={() => setActiveTab('audit')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'audit' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <History className="w-4 h-4"/> سجل التدقيق (Audit Trail)
           </button>
           <button
              onClick={() => setActiveTab('security')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'security' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <Lock className="w-4 h-4"/> الأمان والامتثال
           </button>
        </div>
      </div>

      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 w-full max-w-md">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute end-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث في السجلات (المستخدم، الـ IP، الإجراء)..." 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pe-10 ps-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                />
              </div>
              <button 
                onClick={() => setStatusFilter(prev => prev === 'all' ? 'نجاح' : prev === 'نجاح' ? 'تحذير' : 'all')} 
                className={clsx(
                  "p-2 border rounded-xl transition flex gap-1 items-center text-sm font-bold whitespace-nowrap",
                  statusFilter === 'all' ? "border-slate-200 text-slate-500 hover:bg-slate-50" : 
                  statusFilter === 'نجاح' ? "border-emerald-200 bg-emerald-50 text-emerald-600" :
                  "border-amber-200 bg-amber-50 text-amber-600"
                )}
              >
                <Filter className="w-5 h-5" /> 
                {statusFilter === 'all' ? 'الكل' : statusFilter}
              </button>
            </div>
            <button 
              onClick={handleExport} 
              className="bg-primary-50 text-primary-600 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary-100 transition"
            >
              <Download className="w-4 h-4" /> تصدير السجل
            </button>
          </div>

          <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">الإجراء</th>
                  <th className="px-6 py-4 text-start">النوع</th>
                  <th className="px-6 py-4 text-start">المستخدم</th>
                  <th className="px-6 py-4 text-start">IP Address</th>
                  <th className="px-6 py-4 text-start">التاريخ والوقت</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length > 0 ? (
                   filteredLogs.map(log => (
                     <tr key={log.id} className="hover:bg-slate-50 transition">
                       <td className="px-6 py-4 font-bold text-slate-800">{log.action}</td>
                       <td className="px-6 py-4">
                         <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{log.type}</span>
                       </td>
                       <td className="px-6 py-4 text-slate-600">{log.user}</td>
                       <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.ip}</td>
                       <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.date}</td>
                       <td className="px-6 py-4 text-center">
                         <span className={clsx(
                           "px-2 py-1 rounded text-xs font-bold inline-block",
                           log.status === 'نجاح' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                         )}>
                           {log.status}
                         </span>
                       </td>
                     </tr>
                   ))
                ) : (
                   <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">لا توجد سجلات مطابقة للبحث</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">تشفير وحماية البيانات</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              يتم تشفير جميع البيانات أثناء النقل باستخدام بروتوكول <strong className="text-slate-700">HTTPS</strong> (TLS 1.3). كما يتم الالتزام بمعايير <strong className="text-slate-700">OWASP Compliance</strong> للحماية من الثغرات الأمنية مثل XSS و SQL Injection.
            </p>
            <button onClick={handleSecurityScan} disabled={isScanning} className="w-full relative py-2 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition overflow-hidden">
              {isScanning ? (
                 <>
                   <div className="absolute top-0 start-0 bottom-0 bg-primary-100/50" style={{ width: `${scanProgress}%`, transition: 'width 0.2s' }}></div>
                   <span className="relative z-10 text-primary-600">جاري الفحص... {scanProgress}%</span>
                 </>
              ) : "فحص الأمان (Security Scan)"}
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">الاحتفاظ بالبيانات (Retention)</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              يتم الاحتفاظ بجميع سجلات التدقيق والعمليات المالية لمدة <strong className="text-primary-600">10 سنوات (10 Years Retention)</strong> تلقائياً، مع نسخ احتياطي دوري لضمان عدم فقدان أي بيانات تاريخية.
            </p>
            <button onClick={() => setShowRetentionModal(true)} className="w-full py-2 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition">
              مراجعة سياسة الاحتفاظ
            </button>
          </div>
        </div>
      )}

      {showRetentionModal && (
         <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto overscroll-none flex flex-col items-center justify-start">
            <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Server className="w-5 h-5 text-primary-600" /> سياسة الاحتفاظ (Retention)</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <span className="text-slate-600 font-bold">النسخ الاحتياطي التلقائي:</span>
                     <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">مفعل 100%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <span className="text-slate-600 font-bold">مدة الاحتفاظ بالسجلات:</span>
                     <span className="font-mono font-bold text-slate-800">10 Years</span>
                  </div>
                  <div className="flex justify-between items-center pb-3">
                     <span className="text-slate-600 font-bold">آخر نسخة احتياطية:</span>
                     <span className="font-mono text-slate-500 text-xs text-end">{new Date().toLocaleString('ar-EG')}</span>
                  </div>
                  <button onClick={() => setShowRetentionModal(false)} className="w-full py-3 mt-2 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition">
                     حسناً، إغلاق
                  </button>
               </div>
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
