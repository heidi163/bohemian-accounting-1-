import { useState, useRef } from "react";
import { 
  DownloadCloud, UploadCloud, FileSpreadsheet, FileText, 
  Users, Building2, Wallet, FileDown
} from "lucide-react";
import { clsx } from "clsx";

export function ImportExportPage() {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [toastMsg, setToastMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentImportName, setCurrentImportName] = useState('');
  
  const [recentImports, setRecentImports] = useState<{id: number, name: string, module: string, time: string, dataUrl: string}[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const importModules = [
    { id: 'customers', title: 'بيانات العملاء (Customers Excel)', icon: Users, format: '.xlsx, .csv' },
    { id: 'bank', title: 'كشوف الحساب البنكية (Bank Statements)', icon: Building2, format: '.csv, .qbo, .ofx' },
    { id: 'opening', title: 'الأرصدة الافتتاحية (Opening Balances)', icon: Wallet, format: '.xlsx, .csv' },
  ];

  const exportModules = [
    { id: 'invoices', title: 'الفواتير (Invoices)', icon: FileText, formats: ['PDF', 'Excel'] },
    { id: 'statements', title: 'كشوف الحساب (Statements)', icon: FileSpreadsheet, formats: ['PDF', 'Excel'] },
    { id: 'reports', title: 'التقارير المالية (Reports)', icon: FileDown, formats: ['PDF', 'Excel'] },
  ];

  const triggerUpload = (name: string) => {
    setCurrentImportName(name);
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newImport = {
          id: Date.now(),
          name: file.name,
          module: currentImportName,
          time: new Date().toLocaleTimeString('ar-EG'),
          dataUrl: dataUrl
        };
        setRecentImports(prev => [newImport, ...prev]);
        showToast(`تم رفع ملف ${file.name} بنجاح إلى قسم ${currentImportName} `);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerExport = (name: string, format: string) => {
    showToast(`جاري تصدير ${name} بصيغة ${format}...`);
    
    if (format.toLowerCase() === 'pdf') {
      // A minimal, valid PDF file containing a blank page, encoded in base64
      const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSK0osSQ1JzUzWUcpMzk1PzSvxclXw8Q1xDPBNzUvPSSxV0gQLZtgoK+Qp6CqUJqWWpRcX5eamlRYrGBgYAFpAZEwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjk3CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMiA0IDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDUgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxOTIgMDAwMDAgbiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAyOTUgMDAwMDAgbiAKMDAwMDAwMDM4MyAwMDAwMCBuIAowMDAwMDAwNDQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgNiAwIFI+PgpzdGFydHhyZWYKNTAxCiUlRU9GCg==";
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.split(' ')[0]}_Export_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Excel - We'll generate a valid CSV format that Excel opens natively
      const csvContent = "\uFEFF" + `Module,Format,Date,Status\n"${name}","Excel","${new Date().toLocaleString('ar-EG')}","Success"\n`;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.split(' ')[0]}_Export_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const triggerDownloadImport = (item: {id: number, name: string, module: string, time: string, dataUrl: string}) => {
    showToast(`جاري تحميل/فتح الملف المرفوع: ${item.name}...`);
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2">
            <DownloadCloud className="w-7 h-7 text-primary-600"/> الاستيراد والتصدير (Import / Export)
          </h2>
          <p className="text-slate-500 mt-1">استيراد البيانات من ملفات Excel، البنوك، وتصدير التقارير بصيغ متعددة.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
              onClick={() => setActiveTab('import')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'import' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <UploadCloud className="w-4 h-4"/> الاستيراد (Import)
           </button>
           <button
              onClick={() => setActiveTab('export')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'export' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <DownloadCloud className="w-4 h-4"/> التصدير (Export)
           </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {importModules.map(module => (
              <div key={module.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-primary-300 transition-all flex flex-col gap-4 group">
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center">
                  <module.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{module.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">الصيغ المدعومة: {module.format}</p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => triggerUpload(module.title)}
                    className="w-full bg-slate-50 text-slate-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-50 hover:text-primary-700 transition"
                  >
                    <UploadCloud className="w-4 h-4" /> رفع ملف جديد
                  </button>
                </div>
              </div>
            ))}
          </div>

          {recentImports.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary-600" /> الملفات المرفوعة حديثاً
              </h3>
              <div className="space-y-3">
                {recentImports.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <FileSpreadsheet className="w-5 h-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">القسم: {item.module}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-slate-400">{item.time}</span>
                      <button 
                        onClick={() => triggerDownloadImport(item)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                        title="فتح / تحميل الملف"
                      >
                        <DownloadCloud className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exportModules.map(module => (
            <div key={module.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-emerald-300 transition-all flex flex-col gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <module.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">{module.title}</h3>
                <p className="text-sm text-slate-500 mt-1">تصدير الداتا بضغطة زر</p>
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                {module.formats.map(format => (
                  <button 
                    key={format}
                    onClick={() => triggerExport(module.title, format)}
                    className="flex-1 bg-slate-50 text-slate-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-50 hover:text-emerald-700 transition text-sm"
                  >
                    تصدير {format}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden file input for imports */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
      />

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
