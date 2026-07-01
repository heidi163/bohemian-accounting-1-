import { toast } from 'react-hot-toast';
import { useState, useRef } from "react";
import { 
  FolderOpen, FileText, UploadCloud, File, Download, Link as LinkIcon, 
  Trash2, Search, ShieldCheck, HardDrive, Files, Paperclip, 
  FileImage, FileSpreadsheet, DownloadCloud, Users, Building2, Wallet, FileDown
} from "lucide-react";
import { clsx } from "clsx";
import { SearchableSelect } from "../components/ui/SearchableSelect";

export function FileManagementPage() {
  const [mainTab, setMainTab] = useState<'archive' | 'migration'>('archive');
  const [migrationTab, setMigrationTab] = useState<'import' | 'export'>('import');
  
  // Archive States
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'reports' | 'employees'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [toastMsg, setToastMsg] = useState('');
  const [fileToDelete, setFileToDelete] = useState<{id: number, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Migration States
  const migrationInputRef = useRef<HTMLInputElement>(null);
  const [recentImports, setRecentImports] = useState<{id: number, name: string, module: string, time: string, dataUrl: string}[]>([]);
  
  // Unified Import States
  const [selectedFileToImport, setSelectedFileToImport] = useState<File | null>(null);
  const [selectedImportModule, setSelectedImportModule] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const [files, setFiles] = useState([
    { id: 1, name: 'Invoice_1024.pdf', type: 'Invoice PDFs', format: 'pdf', size: '2.4 MB', date: '2026-06-16', linkedTo: 'فاتورة #1024', tab: 'invoices' },
    { id: 2, name: 'Q1_Financial_Report.xlsx', type: 'Report Exports', format: 'excel', size: '1.1 MB', date: '2026-06-15', linkedTo: '-', tab: 'reports' },
    { id: 3, name: 'Employee_Contract_Ahmed.pdf', type: 'Employee Documents', format: 'pdf', size: '3.5 MB', date: '2026-06-10', linkedTo: 'أحمد محمود', tab: 'employees' },
    { id: 4, name: 'Receipt_0051.jpg', type: 'Attachments', format: 'image', size: '800 KB', date: '2026-06-09', linkedTo: 'مصروفات مكتبية', tab: 'all' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let format = 'document';
      if (['pdf'].includes(ext || '')) format = 'pdf';
      if (['jpg', 'jpeg', 'png'].includes(ext || '')) format = 'image';
      if (['xlsx', 'xls', 'csv'].includes(ext || '')) format = 'excel';

      const newFile = {
        id: Date.now(),
        name: file.name,
        type: 'Attachments',
        format,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toISOString().split('T')[0],
        linkedTo: '-',
        tab: 'all'
      };
      setFiles([newFile, ...files]);
      showToast(`تم رفع الملف ${file.name} بنجاح`);
    }
  };

  const handleDelete = (id: number, name: string) => {
    setFileToDelete({ id, name });
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      setFiles(files.filter(f => f.id !== fileToDelete.id));
      showToast(`تم حذف الملف ${fileToDelete.name} بنجاح`);
      setFileToDelete(null);
    }
  };

  const handleDownload = (file: { id: number, name: string, type: string, size: string, date: string, linkedTo: string }) => {
    showToast(`جاري تحميل الملف ${file.name}...`);
    const reportContent = `File: ${file.name}\nType: ${file.type}\nSize: ${file.size}\nDate: ${file.date}\nLinked To: ${file.linkedTo}\nID: ${file.id}\nExported On: ${new Date().toLocaleString('ar-EG')}`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const normalizeText = (text: string) => text.replace(/[أإآ]/g, 'ا').replace(/[ةه]/g, 'ه').replace(/[ىي]/g, 'ي').toLowerCase();

  const filteredFiles = files.filter(f => {
    const matchesTab = activeTab === 'all' ? true : f.tab === activeTab;
    const matchesType = typeFilter === 'all' ? true : f.type === typeFilter;
    const matchesSearch = normalizeText(f.name).includes(normalizeText(searchQuery)) || normalizeText(f.linkedTo).includes(normalizeText(searchQuery));
    return matchesTab && matchesType && matchesSearch;
  });

  const tabs = [
    { id: 'all', name: 'كل الملفات', icon: FolderOpen },
    { id: 'invoices', name: 'الفواتير', icon: FileText },
    { id: 'reports', name: 'التقارير', icon: FileSpreadsheet },
    { id: 'employees', name: 'مستندات الموظفين', icon: File },
  ] as const;

  const getFileIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'excel': return <FileSpreadsheet className="w-5 h-5 text-primary-500" />;
      case 'image': return <FileImage className="w-5 h-5 text-sky-500" />;
      default: return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const getFileIconBg = (format: string) => {
    switch (format) {
      case 'pdf': return "bg-rose-50 group-hover:bg-rose-100 text-rose-600";
      case 'excel': return "bg-primary-50 group-hover:bg-primary-100 text-primary-600";
      case 'image': return "bg-sky-50 group-hover:bg-sky-100 text-sky-600";
      default: return "bg-slate-50 group-hover:bg-slate-100 text-slate-500";
    }
  };

  // --- Migration Logic ---
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

  const triggerUnifiedUpload = () => {
    migrationInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFileToImport(e.dataTransfer.files[0]);
    }
  };

  const handleUnifiedFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileToImport(e.target.files[0]);
    }
  };

  const confirmUnifiedImport = () => {
    if (!selectedFileToImport) return;
    if (!selectedImportModule) {
      showToast('الرجاء اختيار نوع الملف (القسم) أولاً');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newImport = {
        id: Date.now(),
        name: selectedFileToImport.name,
        module: selectedImportModule,
        time: new Date().toLocaleTimeString('ar-EG'),
        dataUrl: dataUrl
      };
      setRecentImports(prev => [newImport, ...prev]);
      showToast(`تم استيراد بيانات ${selectedFileToImport.name} بنجاح للقسم: ${selectedImportModule}`);
      
      // Reset
      setSelectedFileToImport(null);
      setSelectedImportModule('');
      if (migrationInputRef.current) migrationInputRef.current.value = '';
    };
    reader.readAsDataURL(selectedFileToImport);
  };

  const cancelUnifiedImport = () => {
    setSelectedFileToImport(null);
    setSelectedImportModule('');
    if (migrationInputRef.current) migrationInputRef.current.value = '';
  };

  const triggerMigrationExport = (name: string, format: string) => {
    showToast(`جاري تصدير ${name} بصيغة ${format}...`);
    if (format.toLowerCase() === 'pdf') {
      const pdfBase64 = "JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1LBSK0osSQ1JzUzWUcpMzk1PzSvxclXw8Q1xDPBNzUvPSSxV0gQLZtgoK+Qp6CqUJqWWpRcX5eamlRYrGBgYAFpAZEwplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjk3CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMiA0IDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDUgMCBSPj4KZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagoKNSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1sxIDAgUl0+PgplbmRvYmoKCjYgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDUgMCBSPj4KZW5kb2JqCgp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAxOTIgMDAwMDAgbiAKMDAwMDAwMDAxOCAwMDAwMCBuIAowMDAwMDAwMTczIDAwMDAwIG4gCjAwMDAwMDAyOTUgMDAwMDAgbiAKMDAwMDAwMDM4MyAwMDAwMCBuIAowMDAwMDAwNDQwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA3L1Jvb3QgNiAwIFI+PgpzdGFydHhyZWYKNTAxCiUlRU9GCg==";
      const byteCharacters = atob(pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) { byteNumbers[i] = byteCharacters.charCodeAt(i); }
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
    showToast(`جاري فتح الملف المرفوع: ${item.name}...`);
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = item.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Master Toggle */}
      <div className="flex justify-center mb-2">
        <div className="bg-slate-200/50 p-1.5 rounded-2xl inline-flex shadow-inner">
          <button
            onClick={() => setMainTab('archive')}
            className={clsx(
              "px-8 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2",
              mainTab === 'archive' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <FolderOpen className="w-4 h-4" /> أرشيف الملفات
          </button>
          <button
            onClick={() => setMainTab('migration')}
            className={clsx(
              "px-8 py-3 rounded-xl font-bold transition-all text-sm flex items-center gap-2",
              mainTab === 'migration' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <DownloadCloud className="w-4 h-4" /> استيراد وتصدير البيانات
          </button>
        </div>
      </div>

      {mainTab === 'archive' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
            <div className="ps-2">
              <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
                <FolderOpen className="w-8 h-8 text-primary-600"/> 
                مركز إدارة الملفات 
                <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ File Archive</span>
              </h2>
              <p className="text-slate-500 mt-2 font-medium">الأرشيف الرقمي والمستندات المرتبطة بالقيود والفواتير.</p>
            </div>
            <div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="bg-primary-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center gap-2 hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 whitespace-nowrap">
                 <UploadCloud className="w-5 h-5"/> رفع ملف جديد
              </button>
            </div>
          </div>

          {/* Storage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                <HardDrive className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">المساحة المستخدمة</p>
                <p className="text-2xl font-black text-slate-800">7.8 <span className="text-sm text-slate-400">GB</span></p>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center shrink-0">
                <Files className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">إجمالي الملفات</p>
                <p className="text-2xl font-black text-slate-800">{files.length}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <Paperclip className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">نسبة الملفات المرتبطة</p>
                <p className="text-2xl font-black text-primary-600">{files.length === 0 ? 0 : Math.round((files.filter(f => f.linkedTo !== '-').length / files.length) * 100)}%</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">حالة الأمان</p>
                <p className="text-sm font-black text-slate-800 mt-1 truncate">ملفات مشفرة وآمنة</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 gap-4">
            
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-max overflow-x-auto shrink-0">
              {tabs.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={clsx("px-5 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap", activeTab === tab.id ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50")}>
                    <tab.icon className="w-4 h-4"/> {tab.name}
                 </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:max-w-2xl">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم الملف أو السجل..." 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pe-12 ps-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium text-slate-700"
                />
              </div>
              <div className="w-full md:w-56 z-50">
                 <SearchableSelect 
                   value={typeFilter}
                   onChange={setTypeFilter}
                   options={[
                     { value: 'all', label: 'كل الأنواع' },
                     { value: 'Invoice PDFs', label: 'فواتير (Invoice PDFs)' },
                     { value: 'Report Exports', label: 'تقارير (Report Exports)' },
                     { value: 'Employee Documents', label: 'مستندات موظفين' },
                     { value: 'Attachments', label: 'مرفقات عامة (Attachments)' }
                   ]}
                   allowCreate={false}
                   className="w-full"
                 />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الملف</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">النوع</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">تاريخ الرفع</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">الحجم</th>
                    <th className="px-6 py-5 text-start text-xs font-bold text-slate-500 uppercase tracking-wider">مرتبط بـ (Linked)</th>
                    <th className="px-6 py-5 text-end text-xs font-bold text-slate-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map(file => (
                      <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center transition-colors", getFileIconBg(file.format))}>
                              {getFileIcon(file.format)}
                            </div>
                            <span className="font-bold text-slate-800">{file.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200/60">{file.type}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{file.date}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{file.size}</td>
                        <td className="px-6 py-4">
                          {file.linkedTo !== '-' ? (
                            <span className="inline-flex items-center gap-1.5 text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                              <LinkIcon className="w-3.5 h-3.5" /> {file.linkedTo}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-end">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleDownload(file)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" title="تحميل">
                              <Download className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(file.id, file.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="حذف">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 space-y-4">
                          <Search className="w-12 h-12 opacity-20" />
                          <span className="font-bold text-lg">لا توجد ملفات مطابقة للبحث أو الفلترة</span>
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

      {mainTab === 'migration' && (
        <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
            <div className="ps-2">
              <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
                <DownloadCloud className="w-8 h-8 text-primary-600"/> 
                استيراد وتصدير البيانات 
                <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ Data Migration</span>
              </h2>
              <p className="text-slate-500 mt-2 font-medium">استيراد البيانات المجمعة من ملفات Excel، كشوف الحساب البنكية، وتصدير التقارير.</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl w-max">
               <button
                  onClick={() => setMigrationTab('import')}
                  className={clsx(
                     "px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                     migrationTab === 'import' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
               >
                  <UploadCloud className="w-4 h-4"/> الاستيراد (Import)
               </button>
               <button
                  onClick={() => setMigrationTab('export')}
                  className={clsx(
                     "px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                     migrationTab === 'export' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
               >
                  <DownloadCloud className="w-4 h-4"/> التصدير (Export)
               </button>
            </div>
          </div>

          {migrationTab === 'import' && (
            <div className="space-y-6">
              {/* Unified Import Zone */}
              {!selectedFileToImport ? (
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerUnifiedUpload}
                  className="bg-slate-50/30 border-2 border-dashed border-primary-200 hover:border-primary-500 hover:bg-primary-50/30 rounded-3xl py-8 px-6 text-center cursor-pointer transition-all group max-w-3xl mx-auto"
                >
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1.5">اسحب وأفلت الملف هنا أو اضغط للاختيار</h3>
                  <p className="text-slate-500 font-medium">
                    يدعم ملفات العملاء، كشوف الحساب، الأرصدة الافتتاحية (Excel, CSV, QBO)
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border border-slate-100 p-8 animate-in zoom-in-95 duration-300">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-start">
                      <h3 className="font-black text-slate-800 text-xl">{selectedFileToImport.name}</h3>
                      <p className="text-slate-500 font-mono text-sm mt-1">{(selectedFileToImport.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="w-full md:w-80">
                      <label className="block text-sm font-bold text-slate-700 mb-2">اختر القسم (النوع) الخاص بالبيانات:</label>
                      <SearchableSelect 
                        value={selectedImportModule}
                        onChange={setSelectedImportModule}
                        options={importModules.map(m => ({ value: m.title, label: m.title }))}
                        allowCreate={false}
                        className="w-full"
                        placeholder="اختر القسم..."
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
                    <button 
                      onClick={cancelUnifiedImport}
                      className="flex-1 py-3 px-6 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      إلغاء وإعادة الاختيار
                    </button>
                    <button 
                      onClick={confirmUnifiedImport}
                      disabled={!selectedImportModule}
                      className={clsx(
                        "flex-1 py-3 px-6 rounded-2xl font-bold transition-all shadow-lg",
                        selectedImportModule 
                          ? "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-600/20 active:scale-95" 
                          : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                      )}
                    >
                      تأكيد الاستيراد
                    </button>
                  </div>
                </div>
              )}

              {recentImports.length > 0 && (
                <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6">
                  <h3 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-primary-600" /> العمليات المنفذة حديثاً
                  </h3>
                  <div className="space-y-3">
                    {recentImports.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm">
                            <FileSpreadsheet className="w-6 h-6 text-primary-500" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 text-sm">{item.name}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">القسم: {item.module}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-5">
                          <span className="text-xs font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded-md">{item.time}</span>
                          <button 
                            onClick={() => triggerDownloadImport(item)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition"
                            title="فتح / تحميل الملف"
                          >
                            <DownloadCloud className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {migrationTab === 'export' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exportModules.map(module => (
                <div key={module.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-primary-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5 group relative overflow-hidden">
                  <div className="absolute top-0 end-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <module.icon className="w-32 h-32 text-primary-900" />
                  </div>
                  <div className="relative z-10 w-14 h-14 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <module.icon className="w-7 h-7" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-slate-800 text-lg">{module.title}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-1.5">تصدير الداتا بضغطة زر</p>
                  </div>
                  <div className="relative z-10 mt-auto pt-5 flex gap-3">
                    {module.formats.map(format => (
                      <button 
                        key={format}
                        onClick={() => triggerMigrationExport(module.title, format)}
                        className="flex-1 bg-slate-50 border border-slate-100 text-slate-700 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 hover:shadow-md hover:shadow-primary-100 transition-all text-sm"
                      >
                        {format === 'PDF' && <FileText className="w-4 h-4 text-rose-500" />}
                        {format === 'Excel' && <FileSpreadsheet className="w-4 h-4 text-primary-500" />}
                        تصدير {format}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <input type="file" ref={migrationInputRef} onChange={handleUnifiedFileSelect} className="hidden" />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setFileToDelete(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute top-0 start-0 w-full h-1.5 bg-rose-500"></div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تأكيد الحذف</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">
                هل أنت متأكد من حذف الملف <span className="font-bold text-slate-700 dir-ltr inline-block">{fileToDelete.name}</span> نهائياً؟
              </p>
              <div className="flex gap-3">
                <button onClick={() => setFileToDelete(null)} className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">إلغاء</button>
                <button onClick={confirmDelete} className="flex-1 py-3 px-4 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20 transition-all active:scale-95">نعم، احذف</button>
              </div>
            </div>
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
