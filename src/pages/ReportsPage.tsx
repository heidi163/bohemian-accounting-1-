import { useEffect, useState } from "react";
import { type StandardReportMeta } from "../types";
import { clsx } from "clsx";
import { FileBarChart, Scale, TrendingUp, Building, Banknote, BookOpen, LayoutDashboard, Calendar, Clock, Target, FolderKanban, Network, FileDown, Eye, X, Plus } from "lucide-react";
import { getCompanyKey } from '../utils/storage';
import { SearchableSelect } from '../components/ui/SearchableSelect';

const getIcon = (iconType: string) => {
  switch(iconType) {
    case 'scale': return <Scale className="w-6 h-6" />;
    case 'trending-up': return <TrendingUp className="w-6 h-6" />;
    case 'building': return <Building className="w-6 h-6" />;
    case 'banknote': return <Banknote className="w-6 h-6" />;
    case 'book-open': return <BookOpen className="w-6 h-6" />;
    case 'layout-dashboard': return <LayoutDashboard className="w-6 h-6" />;
    case 'calendar': return <Calendar className="w-6 h-6" />;
    case 'clock': return <Clock className="w-6 h-6" />;
    case 'target': return <Target className="w-6 h-6" />;
    case 'folder-kanban': return <FolderKanban className="w-6 h-6" />;
    case 'network': return <Network className="w-6 h-6" />;
    default: return <FileBarChart className="w-6 h-6" />;
  }
};

export function ReportsPage() {
  const [reports, setReports] = useState<StandardReportMeta[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [newReportForm, setNewReportForm] = useState({ title: '', description: '', category: 'financial', iconType: 'file-bar-chart' });

  useEffect(() => {
    fetch("/api/reports/standard")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => setReports(data.data))
      .catch(() => {
        const local = localStorage.getItem(getCompanyKey('mock_reports'));
        if (local) {
          setReports(JSON.parse(local));
        } else {
          const defaultReports = [
            { id: "trial_balance", title: "ميزان المراجعة (Trial Balance)", description: "يعرض أرصدة جميع الحسابات (مدينة ودائنة) في فترة محددة للتأكد من توازن الحسابات.", category: "financial", iconType: "scale" },
            { id: "income_statement", title: "قائمة الدخل (Income Statement)", description: "يُلخص الإيرادات والمصروفات لتحديد صافي الربح أو الخسارة.", category: "financial", iconType: "trending-up" },
            { id: "balance_sheet", title: "الميزانية العمومية (Balance Sheet)", description: "يوضح المركز المالي للشركة (الأصول، الخصوم، حقوق الملكية).", category: "financial", iconType: "building" }
          ];
          localStorage.setItem(getCompanyKey('mock_reports'), JSON.stringify(defaultReports));
          setReports(defaultReports);
        }
      });
  }, []);

  const handleAddReport = () => {
    if (!newReportForm.title) return;
    
    const newReport: StandardReportMeta = {
      id: `custom_${Date.now()}`,
      title: newReportForm.title,
      description: newReportForm.description || 'تقرير مخصص تمت إضافته يدوياً',
      category: newReportForm.category,
      iconType: newReportForm.iconType
    };

    const updatedReports = [...reports, newReport];
    setReports(updatedReports);
    localStorage.setItem(getCompanyKey('mock_reports'), JSON.stringify(updatedReports));
    setIsAddReportOpen(false);
    setNewReportForm({ title: '', description: '', category: 'financial', iconType: 'file-bar-chart' });
  };

  const openReport = async (reportId: string) => {
    setActiveReport(reportId);
    setReportData(null); // loading state
    try {
      const res = await fetch(`/api/reports/data/${reportId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReportData(data.data);
    } catch {
      // Return distinct mock data based on report type
      const fallbackData: Record<string, any[]> = {
        trial_balance: [
          { account: "النقدية بالخزينة", debit: 50000, credit: 0 },
          { account: "البنك الأهلي - EGP", debit: 250000, credit: 0 },
          { account: "ذمم مدينة (عملاء)", debit: 120500, credit: 0 },
          { account: "مخزون بضاعة", debit: 85000, credit: 0 },
          { account: "ذمم دائنة (موردون)", debit: 0, credit: 40000 },
          { account: "قرض بنكي طويل الأجل", debit: 0, credit: 400000 },
          { account: "رأس المال", debit: 0, credit: 265500 },
        ],
        income_statement: [
          { account: "إيرادات المبيعات", debit: 0, credit: 1606000 },
          { account: "تكلفة البضاعة المباعة", debit: 450000, credit: 0 },
          { account: "مصروفات الرواتب", debit: 350000, credit: 0 },
          { account: "مصروفات الإيجار", debit: 120000, credit: 0 },
          { account: "مصروفات التسويق", debit: 85000, credit: 0 },
          { account: "مصروفات الإهلاك", debit: 47222, credit: 0 },
          { account: "مصروفات متنوعة", debit: 30000, credit: 0 },
        ],
        balance_sheet: [
          { account: "إجمالي الأصول المتداولة", debit: 505500, credit: 0 },
          { account: "إجمالي الأصول الثابتة (صافي)", debit: 1207778, credit: 0 },
          { account: "إجمالي الخصوم المتداولة", debit: 0, credit: 40000 },
          { account: "إجمالي الخصوم طويلة الأجل", debit: 0, credit: 400000 },
          { account: "رأس المال", debit: 0, credit: 1000000 },
          { account: "الأرباح المحتجزة", debit: 0, credit: 273278 },
        ],
        aging: [
          { account: "Sealy KSA - 0-30 يوم", debit: 50000, credit: 0 },
          { account: "Sealy KSA - 31-60 يوم", debit: 70500, credit: 0 },
          { account: "Tech Solutions - 61-90 يوم", debit: 75000, credit: 0 },
          { account: "Bohemian Geeks - 0-30 يوم", debit: 10400, credit: 0 },
        ],
        gl: [
          { account: "JE-2026-00001 | فتح الأرصدة", debit: 500000, credit: 500000 },
          { account: "JE-2026-00002 | إيجار يونيو", debit: 15000, credit: 15000 },
          { account: "JE-2026-00003 | تحويل بين شركات", debit: 120500, credit: 120500 },
        ],
      };

      const data = fallbackData[reportId] || fallbackData['trial_balance'];
      setTimeout(() => setReportData(data), 600);
    }
  };

  const filteredReports = activeCategory === 'all' ? reports : reports.filter(r => r.category === activeCategory);

  const exportToExcel = () => {
    if (!reportData) return;
    const reportName = reports.find(r => r.id === activeReport)?.title || 'Report';
    
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
    csvContent += "الحساب (Account),مدين (Debit),دائن (Credit)\n";
    
    reportData.forEach((row: any) => {
      csvContent += `"${row.account}",${row.debit},${row.credit}\n`;
    });
    
    const totalDebit = reportData.reduce((sum: number, r: any) => sum + r.debit, 0);
    const totalCredit = reportData.reduce((sum: number, r: any) => sum + r.credit, 0);
    csvContent += `"الإجمالي:",${totalDebit},${totalCredit}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    if (!reportData) return;
    const reportName = reports.find(r => r.id === activeReport)?.title || 'Report';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const tableRows = reportData.map((row: any) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0;">${row.account}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-family: monospace;">${new Intl.NumberFormat('ar-EG').format(row.debit)}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-family: monospace;">${new Intl.NumberFormat('ar-EG').format(row.credit)}</td>
      </tr>
    `).join('');
    
    const totalDebit = reportData.reduce((sum: number, r: any) => sum + r.debit, 0);
    const totalCredit = reportData.reduce((sum: number, r: any) => sum + r.credit, 0);

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>${reportName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
            h1 { color: #0f172a; text-align: center; margin-bottom: 30px; font-size: 24px; }
            table { width: 100%; border-collapse: collapse; text-align: right; }
            th { background: #1e293b; color: white; padding: 14px 10px; font-size: 14px; }
            .totals { font-weight: bold; background: #f8fafc; }
            .totals td { padding: 14px 10px; border-top: 2px solid #cbd5e1; font-family: monospace; }
          </style>
        </head>
        <body>
          <h1>${reportName}</h1>
          <table>
            <thead>
              <tr>
                <th>الحساب (Account)</th>
                <th style="text-align: left;">مدين (Debit)</th>
                <th style="text-align: left;">دائن (Credit)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="totals">
                <td style="font-family: system-ui;">الإجمالي:</td>
                <td style="text-align: left;">${new Intl.NumberFormat('ar-EG').format(totalDebit)}</td>
                <td style="text-align: left;">${new Intl.NumberFormat('ar-EG').format(totalCredit)}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            تم استخراج هذا التقرير آلياً من نظام بوهيميان جيكس المحاسبي في ${new Date().toLocaleDateString('ar-EG')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><FileBarChart className="w-7 h-7 text-primary-600"/> التقارير المحاسبية القياسية</h2>
          <p className="text-slate-500 mt-1">تقارير مالية، إدارية، تشغيلية، ومجمعة جاهزة للاستخدام الفوري.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
           <div className="flex bg-slate-100 p-1 rounded-xl flex-wrap">
              {['all', 'financial', 'management', 'operational', 'consolidated'].map(cat => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={clsx(
                       "px-4 py-2 rounded-lg text-sm font-bold capitalize transition",
                       activeCategory === cat ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                 >
                    {cat === 'all' ? 'الكل' : cat === 'financial' ? 'مالية' : cat === 'management' ? 'إدارية' : cat === 'operational' ? 'تشغيلية' : 'مجمعة'}
                 </button>
              ))}
           </div>
           <button onClick={() => setIsAddReportOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md shrink-0">
              <Plus className="w-5 h-5" />
              إضافة تقرير جديد
           </button>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredReports.map(report => (
            <div key={report.id} onClick={() => openReport(report.id)} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary-300 transition cursor-pointer group flex flex-col">
               <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-100 transition">
                     {getIcon(report.iconType)}
                  </div>
                  <div className="flex-1">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{report.category}</div>
                     <h3 className="font-bold text-slate-800 text-lg leading-snug">{report.title}</h3>
                  </div>
               </div>
               <p className="text-slate-500 text-sm flex-1">{report.description}</p>
               <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                  <span className="text-primary-600 font-bold group-hover:underline flex items-center gap-1"><Eye className="w-4 h-4"/> عرض التقرير</span>
                  <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition">
                     <FileDown className="w-4 h-4 text-primary-600"/>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {activeReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/80">
              <div>
                 <h3 className="text-xl font-bold text-slate-800">{reports.find(r => r.id === activeReport)?.title}</h3>
                 <p className="text-sm text-slate-500 mt-1">تقرير مستخرج في {new Date().toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={exportToExcel} className="px-4 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-lg text-sm font-bold transition flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> تصدير Excel
                 </button>
                 <button onClick={exportToPDF} className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-sm font-bold transition flex items-center gap-2">
                    <FileDown className="w-4 h-4" /> تصدير PDF
                 </button>
                 <button onClick={() => setActiveReport(null)} className="ms-2 w-10 h-10 flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-full transition">
                    <X className="w-5 h-5"/>
                 </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto flex-1 bg-slate-100/50">
               {!reportData ? (
                  <div className="h-full flex items-center justify-center">
                     <div className="text-slate-400 font-bold animate-pulse">جاري سحب البيانات...</div>
                  </div>
               ) : (
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                     <table className="w-full text-start text-sm">
                        <thead className="bg-slate-800 text-slate-200 font-bold uppercase text-xs">
                           <tr>
                              <th className="px-6 py-4 text-start border-b border-slate-700">الحساب (Account)</th>
                              <th className="px-6 py-4 text-end border-b border-slate-700">مدين (Debit)</th>
                              <th className="px-6 py-4 text-end border-b border-slate-700">دائن (Credit)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                           {reportData.map((row: any, i: number) => (
                              <tr key={i} className="hover:bg-slate-50">
                                 <td className="px-6 py-4 font-bold font-sans">{row.account}</td>
                                 <td className="px-6 py-4 text-end">{new Intl.NumberFormat('ar-EG').format(row.debit)}</td>
                                 <td className="px-6 py-4 text-end">{new Intl.NumberFormat('ar-EG').format(row.credit)}</td>
                              </tr>
                           ))}
                           {/* Totals Row */}
                           <tr className="bg-slate-50 font-black">
                              <td className="px-6 py-4 text-end font-sans text-slate-500">الإجمالي:</td>
                              <td className="px-6 py-4 text-end border-t-2 border-slate-300">{new Intl.NumberFormat('ar-EG').format(reportData.reduce((sum: number, r: any) => sum + r.debit, 0))}</td>
                              <td className="px-6 py-4 text-end border-t-2 border-slate-300">{new Intl.NumberFormat('ar-EG').format(reportData.reduce((sum: number, r: any) => sum + r.credit, 0))}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {isAddReportOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إضافة تقرير جديد</h3>
              <button onClick={() => setIsAddReportOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">اسم التقرير</label>
                 <input 
                   type="text" 
                   value={newReportForm.title} 
                   onChange={(e) => setNewReportForm({...newReportForm, title: e.target.value})} 
                   className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary-500" 
                   placeholder="مثال: تقرير المبيعات الربع سنوي"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">التصنيف (Category)</label>
                 <SearchableSelect 
                   value={newReportForm.category} 
                   onChange={(val) => setNewReportForm({...newReportForm, category: val})}
                   options={[
                     { value: 'financial', label: 'مالية' },
                     { value: 'management', label: 'إدارية' },
                     { value: 'operational', label: 'تشغيلية' },
                     { value: 'consolidated', label: 'مجمعة' }
                   ]}
                   placeholder="اختر أو اكتب تصنيف جديد..."
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">أيقونة التقرير (Icon)</label>
                 <SearchableSelect 
                   value={newReportForm.iconType} 
                   onChange={(val) => setNewReportForm({...newReportForm, iconType: val})}
                   options={[
                     { value: 'scale', label: 'ميزان (Scale)' },
                     { value: 'trending-up', label: 'مؤشر صعود (Trending Up)' },
                     { value: 'building', label: 'مبنى / ميزانية (Building)' },
                     { value: 'banknote', label: 'أموال (Banknote)' },
                     { value: 'book-open', label: 'كتاب مفتوح (Book)' },
                     { value: 'target', label: 'هدف (Target)' },
                     { value: 'file-bar-chart', label: 'تقرير افتراضي (Default)' }
                   ]}
                   placeholder="اختر أيقونة للتقرير..."
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">وصف التقرير (Description)</label>
                 <textarea 
                   value={newReportForm.description} 
                   onChange={(e) => setNewReportForm({...newReportForm, description: e.target.value})} 
                   className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 resize-none h-24" 
                   placeholder="اكتب وصفاً مختصراً للتقرير..."
                 />
               </div>
              <div className="pt-4">
                 <button onClick={handleAddReport} disabled={!newReportForm.title} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-sm rounded-xl transition disabled:opacity-50">
                   حفظ وإضافة التقرير
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
