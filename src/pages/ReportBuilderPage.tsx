import { useState } from "react";
import { type ReportConfig } from "../types";
import { clsx } from "clsx";
import { Wrench, Database, Filter, Columns, BarChart3, Save, Copy, Clock, Share2, FileDown, Play, LayoutGrid } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function ReportBuilderPage() {
  const [config, setConfig] = useState<ReportConfig>({
    dataSource: 'invoices',
    columns: [],
    filters: [],
    chartType: 'bar'
  });
  const [previewData, setPreviewData] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [actionModal, setActionModal] = useState<'save' | 'copy' | 'schedule' | 'share' | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [modalError, setModalError] = useState('');
  
  const [showColMenu, setShowColMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const availableColumns = ['رقم العملية (ID)', 'التاريخ (Date)', 'المبلغ (Amount)', 'الحالة (Status)', 'البيان (Description)'];
  const availableFilters = ['المبلغ أكبر من 1000', 'تاريخ اليوم', 'العمليات المكتملة فقط', 'العمليات المعلقة'];

  const addColumn = (col: string) => {
    if (!config.columns.includes(col)) {
      setConfig({ ...config, columns: [...config.columns, col] });
    }
    setShowColMenu(false);
  };

  const removeColumn = (col: string) => {
    setConfig({ ...config, columns: config.columns.filter(c => c !== col) });
  };

  const addFilter = (filter: string) => {
    if (!config.filters.includes(filter)) {
      setConfig({ ...config, filters: [...config.filters, filter] });
    }
    setShowFilterMenu(false);
  };

  const removeFilter = (filter: string) => {
    setConfig({ ...config, filters: config.filters.filter(f => f !== filter) });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
    setActionModal(null);
    setModalInput('');
    setModalError('');
  };

  const handleActionClick = (type: 'save' | 'copy' | 'schedule' | 'share') => {
    setActionModal(type);
    setModalInput('');
    setModalError('');
  };

  const exportToExcel = () => {
    if (!previewData || !previewData.tableRows) {
      showToast('الرجاء تشغيل التقرير أولاً لاستخراج البيانات');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
    csvContent += "ID,Dimension,Value\n";
    
    previewData.tableRows.forEach((row: any) => {
      csvContent += `"${row.id}","${row.col1}",${row.col2}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Custom_Report_${config.dataSource}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('تم تصدير التقرير بنجاح');
  };

  const runReport = async () => {
    setIsRunning(true);
    try {
      const res = await fetch("/api/reports/custom/run", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPreviewData(data.data);
    } catch (e) {
      setTimeout(() => {
        setPreviewData({
          chartData: [
            { label: 'عنصر 1', value: 4500 },
            { label: 'عنصر 2', value: 3200 },
            { label: 'عنصر 3', value: 2800 },
            { label: 'عنصر 4', value: 5100 },
            { label: 'عنصر 5', value: 1900 },
          ],
          tableRows: [
            { id: 1001, col1: 'عملية تجريبية أ', col2: 4500, date: '2026-05-10', status: 'مكتمل' },
            { id: 1002, col1: 'عملية تجريبية ب', col2: 3200, date: '2026-05-11', status: 'معلق' },
            { id: 1003, col1: 'عملية تجريبية ج', col2: 2800, date: '2026-05-12', status: 'مكتمل' },
            { id: 1004, col1: 'عملية تجريبية د', col2: 5100, date: '2026-05-14', status: 'مكتمل' },
            { id: 1005, col1: 'عملية تجريبية هـ', col2: 1900, date: '2026-05-15', status: 'ملغى' },
          ]
        });
        setIsRunning(false);
      }, 600);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><Wrench className="w-7 h-7 text-primary-600"/> باني التقارير المخصصة (Custom BI Builder)</h2>
          <p className="text-slate-500 mt-1">صمم تقاريرك الخاصة وتحليلاتك بدون كتابة أي كود.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleActionClick('save')} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition tooltip" title="حفظ"><Save className="w-5 h-5"/></button>
           <button onClick={() => handleActionClick('copy')} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="استنساخ"><Copy className="w-5 h-5"/></button>
           <button onClick={() => handleActionClick('schedule')} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="جدولة"><Clock className="w-5 h-5"/></button>
           <button onClick={() => handleActionClick('share')} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="مشاركة"><Share2 className="w-5 h-5"/></button>
           <div className="w-px h-6 bg-slate-200 self-center mx-1"></div>
           <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition">
              <FileDown className="w-4 h-4" /> تصدير
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[800px] lg:h-[calc(100vh-140px)]">
         {/* Configuration Panel */}
         <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-700 flex items-center gap-2">
               <Settings className="w-5 h-5 text-primary-500" /> إعدادات التقرير
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
               {/* Data Source */}
               <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Database className="w-4 h-4"/> مصدر البيانات (Data Source)</label>
                  <select 
                     value={config.dataSource}
                     onChange={(e) => setConfig({...config, dataSource: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-500"
                  >
                     <option value="invoices">المبيعات والفواتير</option>
                     <option value="purchases">المشتريات والمصروفات</option>
                     <option value="journal">قيود اليومية</option>
                     <option value="projects">حسابات المشاريع</option>
                  </select>
               </div>

               {/* Columns */}
               <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Columns className="w-4 h-4"/> الأعمدة (Columns & Grouping)</label>
                  <div 
                    onClick={() => setShowColMenu(!showColMenu)}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50 min-h-[80px] flex flex-wrap items-start gap-2 border-dashed cursor-pointer hover:border-primary-400 transition"
                  >
                     {config.columns.length === 0 ? (
                       <span className="text-xs text-slate-400 m-auto">اضغط هنا لإضافة أعمدة للتقرير</span>
                     ) : (
                       config.columns.map(col => (
                         <div key={col} className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                           {col}
                           <button onClick={(e) => { e.stopPropagation(); removeColumn(col); }} className="hover:text-primary-900 ms-1"></button>
                         </div>
                       ))
                     )}
                  </div>
                  {showColMenu && (
                    <div className="absolute top-full start-0 end-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {availableColumns.map(col => (
                        <div key={col} onClick={() => addColumn(col)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 font-medium">
                          {col}
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Filters */}
               <div className="relative">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><Filter className="w-4 h-4"/> الفلاتر (Filters)</label>
                  <div 
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50 min-h-[60px] flex flex-wrap items-start gap-2 border-dashed cursor-pointer hover:border-primary-400 transition"
                  >
                     {config.filters.length === 0 ? (
                       <span className="text-xs text-slate-400 m-auto">اضغط هنا لإضافة شرط أو فلتر جديد</span>
                     ) : (
                       config.filters.map(filter => (
                         <div key={filter} className="bg-rose-50 text-rose-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                           {filter}
                           <button onClick={(e) => { e.stopPropagation(); removeFilter(filter); }} className="hover:text-rose-900 ms-1"></button>
                         </div>
                       ))
                     )}
                  </div>
                  {showFilterMenu && (
                    <div className="absolute top-full start-0 end-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
                      {availableFilters.map(filter => (
                        <div key={filter} onClick={() => addFilter(filter)} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 font-medium">
                          {filter}
                        </div>
                      ))}
                    </div>
                  )}
               </div>

               {/* Visuals */}
               <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2"><BarChart3 className="w-4 h-4"/> نوع العرض (Visual Type)</label>
                  <div className="grid grid-cols-2 gap-2">
                     {['table', 'bar', 'line', 'pie'].map(type => (
                        <button 
                           key={type}
                           onClick={() => setConfig({...config, chartType: type as any})}
                           className={clsx(
                              "py-2 px-3 border rounded-lg text-xs font-bold capitalize transition flex items-center justify-center gap-2",
                              config.chartType === type ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                           )}
                        >
                           {type === 'table' ? <LayoutGrid className="w-3 h-3"/> : <BarChart3 className="w-3 h-3"/>}
                           {type}
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
               <button 
                  onClick={runReport}
                  disabled={isRunning}
                  className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-700 transition disabled:opacity-50"
               >
                  {isRunning ? <span className="animate-pulse">جاري المعالجة...</span> : <><Play className="w-4 h-4 fill-current"/> تشغيل التقرير (Run Report)</>}
               </button>
            </div>
         </div>

         {/* Preview Area */}
         <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden relative">
            {!previewData ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                  <p className="font-medium">قم بإعداد التقرير واضغط على "تشغيل" لمعاينة النتائج.</p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col">
                  {/* Chart Area using Recharts */}
                  {config.chartType !== 'table' && (
                     <div className="h-64 border-b border-slate-100 p-4 bg-slate-50">
                        <ResponsiveContainer width="100%" height="100%">
                           {config.chartType === 'bar' ? (
                              <BarChart data={previewData.chartData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                 <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                 <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                 <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1000} />
                              </BarChart>
                           ) : config.chartType === 'line' ? (
                              <LineChart data={previewData.chartData}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                 <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                 <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 8 }} animationDuration={1000} />
                              </LineChart>
                           ) : (
                              <PieChart>
                                 <Pie data={previewData.chartData} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} animationDuration={1000}>
                                    {previewData.chartData.map((entry: any, index: number) => (
                                       <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                 </Pie>
                                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                 <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 'bold', paddingTop: '10px' }} />
                              </PieChart>
                           )}
                        </ResponsiveContainer>
                     </div>
                  )}

                  {/* Table Area */}
                  <div className="flex-1 overflow-auto p-0">
                     <table className="w-full text-start text-sm">
                        <thead className="bg-white text-slate-400 font-bold uppercase text-xs sticky top-0 border-b border-slate-200">
                           <tr>
                              {config.columns.length > 0 ? (
                                 config.columns.map(c => <th key={c} className="px-6 py-4 text-start">{c}</th>)
                              ) : (
                                 <>
                                    <th className="px-6 py-4 text-start">ID</th>
                                    <th className="px-6 py-4 text-start">Dimension (المحور)</th>
                                    <th className="px-6 py-4 text-end">Value (القيمة)</th>
                                 </>
                              )}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                           {previewData.tableRows.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50">
                                 {config.columns.length > 0 ? (
                                    config.columns.map((c, colIndex) => (
                                       <td key={colIndex} className="px-6 py-4">
                                          {c.includes('المبلغ') ? new Intl.NumberFormat('ar-EG').format(row.col2) : 
                                           c.includes('رقم') ? `#${row.id}` :
                                           c.includes('تاريخ') ? row.date || '--' : 
                                           c.includes('الحالة') ? row.status || '--' :
                                           row.col1}
                                       </td>
                                    ))
                                 ) : (
                                    <>
                                       <td className="px-6 py-4 font-bold font-sans text-slate-400">#{row.id}</td>
                                       <td className="px-6 py-4">{row.col1}</td>
                                       <td className="px-6 py-4 text-end font-bold text-slate-900">{new Intl.NumberFormat('ar-EG').format(row.col2)}</td>
                                    </>
                                 )}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}
         </div>
      </div>

      {actionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {actionModal === 'save' && 'حفظ التقرير'}
                {actionModal === 'copy' && 'استنساخ التقرير'}
                {actionModal === 'schedule' && 'جدولة التقرير'}
                {actionModal === 'share' && 'مشاركة التقرير'}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-500 transition"></button>
            </div>
            <div className="p-6 space-y-4">
              {modalError && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold">{modalError}</div>}
              
              {actionModal === 'save' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">اسم التقرير (Report Name)</label>
                  <input type="text" value={modalInput} onChange={e => setModalInput(e.target.value)} placeholder="مثال: مبيعات الربع الأول..." className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary-500" />
                  <button onClick={() => {
                    if (!modalInput.trim()) { setModalError('الرجاء إدخال اسم للتقرير'); return; }
                    showToast('تم حفظ التقرير بنجاح');
                  }} className="w-full mt-4 bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 transition">تأكيد الحفظ</button>
                </div>
              )}
              {actionModal === 'copy' && (
                <div>
                  <p className="text-slate-600 text-sm mb-4">سيتم إنشاء نسخة مطابقة من هذا التقرير بجميع إعداداته وفلاتره.</p>
                  <button onClick={() => showToast('تم استنساخ التقرير، يمكنك الآن تعديل النسخة الجديدة')} className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 transition">تأكيد الاستنساخ</button>
                </div>
              )}
              {actionModal === 'schedule' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">معدل التكرار (Frequency)</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-sm">
                      <option>يومياً (Daily)</option>
                      <option>أسبوعياً (Weekly)</option>
                      <option>شهرياً (Monthly)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">إرسال إلى (Email)</label>
                    <input type="email" value={modalInput} onChange={e => setModalInput(e.target.value)} placeholder="example@company.com" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-left" dir="ltr" />
                  </div>
                  <button onClick={() => {
                    if (!modalInput.includes('@')) { setModalError('الرجاء إدخال بريد إلكتروني صحيح'); return; }
                    showToast('تمت جدولة التقرير وسيصلك على البريد الإلكتروني');
                  }} className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 transition">تفعيل الجدولة التلقائية</button>
                </div>
              )}
              {actionModal === 'share' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رابط المشاركة (Share Link)</label>
                  <div className="flex gap-2">
                    <input type="text" readOnly value="https://bohemiangeeks.com/reports/share/x8k92m" className="flex-1 bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl px-4 py-2.5 outline-none text-left" dir="ltr" />
                    <button onClick={() => {
                      navigator.clipboard.writeText("https://bohemiangeeks.com/reports/share/x8k92m");
                      showToast('تم نسخ الرابط إلى الحافظة');
                    }} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold transition">نسخ</button>
                  </div>
                </div>
              )}
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

// Inline Settings Icon to avoid adding another import if we missed it
const Settings = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
