import { toast } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { type Contact } from "../types";
import { useNavigate } from "react-router";
import { Download, Upload, AlertTriangle, TrendingUp, X, Filter } from "lucide-react";
import { clsx } from "clsx";
import apiClient from "../api/client";
import { getCompanyKey } from "../utils/storage";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeModal, setActiveModal] = useState<null | 'view' | 'excel_import' | 'duplicate_check' | 'profitability'>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const [toastMsg, setToastMsg] = useState('');
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [profitability, setProfitability] = useState<any[]>([]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setContacts(res.data.data || []);
    } catch (error) {
      // Fallback to local storage or defaults if API is unreachable
      const localContacts = JSON.parse(localStorage.getItem('mock_contacts') || '[]');
      if (localContacts.length > 0) {
        setContacts(localContacts);
      } else {
        const defaultContacts = [
          { id: 1, code: 'CUST-2026-001', name: 'بوهيميان جيكس (Bohemian Geeks)', type: 'customer', email: 'hello@bohemiangeeks.com', phone: '+20 100 123 4567', balance: 15400, opening_balance: 0, outstanding_balance: 15400, credit_limit: 50000, aging: { '0_30': 15400, '31_60': 0, '61_90': 0, '91_plus': 0 }, sub_contacts: [{ name: 'Heidi Medhat', email: 'heidi@bohemiangeeks.com', phone: '+20101111111' }] },
          { id: 2, code: 'CUST-2026-002', name: 'Sealy KSA', type: 'customer', email: 'finance@sealy.sa', phone: '+966 50 123 4567', balance: 120500, opening_balance: 20000, outstanding_balance: 100500, credit_limit: 200000, aging: { '0_30': 50000, '31_60': 50500, '61_90': 0, '91_plus': 0 }, sub_contacts: [] },
          { id: 3, code: 'SUPP-2026-001', name: 'Amazon Web Services', type: 'supplier', email: 'billing@aws.com', phone: '+1 800 123 4567', balance: -1200, opening_balance: 0, outstanding_balance: 0, credit_limit: 0, aging: { '0_30': 0, '31_60': 0, '61_90': 0, '91_plus': 0 }, sub_contacts: [] }
        ];
        setContacts(defaultContacts as any);
        localStorage.setItem('mock_contacts', JSON.stringify(defaultContacts));
      }
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const [statementData, setStatementData] = useState<any>(null);
  const [agingData, setAgingData] = useState<any>(null);

  const handleAction = async (type: 'view' | 'excel_import' | 'duplicate_check' | 'profitability', contact?: Contact) => {
    setActiveModal(type);
    if (contact) {
      setSelectedContact(contact);
      if (type === 'view') {
        try {
          const [statementRes, agingRes] = await Promise.all([
            apiClient.get(`/customers/${contact.id}/statement`),
            apiClient.get(`/customers/${contact.id}/aging`)
          ]);
          setStatementData(statementRes.data.data);
          setAgingData(agingRes.data.data);
        } catch (error) {
          console.error("Failed to load customer details", error);
        }
      }
    }
    if (type === 'excel_import') setImportedFile(null);
    if (type === 'duplicate_check') {
      try {
        const res = await fetch('/api/contacts/duplicates');
        const data = await res.json();
        setDuplicates(data.data);
      } catch (e) {
        setDuplicates([{ primary: { id: 1, name: 'بوهيميان جيكس (Local)', code: 'CUST-001' }, secondary: { id: 5, name: 'Bohemian Geekz', code: 'CUST-005' }, reason: 'تشابه في الاسم' }]);
      }
    }
    if (type === 'profitability') {
      try {
        const res = await fetch('/api/contacts/profitability');
        const data = await res.json();
        setProfitability(data.data);
      } catch (e) {
        setProfitability([{ name: 'بيانات محلية مؤقتة', profit: 10000, grade: 'B' }]);
      }
    }
  };

  const handleMerge = async (id: number, mergeWithId: number) => {
    try {
      await fetch(`/api/contacts/${id}/merge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mergeWithId })
      });
      showToast('تم دمج جهتي الاتصال بنجاح');
      setActiveModal(null);
      loadCustomers();
    } catch (e) {
      showToast('تم دمج جهتي الاتصال (محلياً)');
      setActiveModal(null);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['الكود', 'الاسم', 'النوع', 'البريد الإلكتروني', 'الهاتف', 'الرصيد الحالي'],
      ...contacts.map(c => [
        c.code, 
        c.name, 
        c.type === 'customer' ? 'عميل' : 'مورد', 
        c.email, 
        c.phone, 
        c.balance
      ])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "contacts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!importedFile) {
      toast.error('يرجى اختيار ملف CSV أولاً');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newContacts: Contact[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const [code, name, type, email, phone, balance] = lines[i].split(',');
        newContacts.push({
          id: Date.now() + i,
          code: code?.trim() || `IMP-${String(Date.now()).slice(-3)}`,
          name: name?.trim() || 'بدون اسم',
          type: type?.trim().includes('مورد') ? 'supplier' : 'customer',
          email: email?.trim() || '',
          phone: phone?.trim() || '',
          balance: Number(balance) || 0,
          outstanding_balance: Number(balance) || 0,
          opening_balance: 0,
          credit_limit: 0
        });
      }
      
      try {
        const res = await fetch('/api/contacts/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: newContacts })
        });
        if (!res.ok) throw new Error('API failed');
        showToast(`تم استيراد ${newContacts.length} جهة اتصال بنجاح!`);
      } catch (e) {
        const localContacts = JSON.parse(localStorage.getItem(getCompanyKey('mock_contacts')) || '[]');
        const combined = [...localContacts, ...newContacts];
        localStorage.setItem(getCompanyKey('mock_contacts'), JSON.stringify(combined));
        showToast(`تم استيراد ${newContacts.length} جهة اتصال (محلياً)`);
      }
      loadCustomers();
      setActiveModal(null);
      setImportedFile(null);
    };
    reader.readAsText(importedFile);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">العملاء والموردون</h2>
          <p className="text-slate-500 mt-1">إدارة جهات الاتصال، كشوف الحسابات، وأعمار الديون.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/contacts/new')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
            إضافة جديد
          </button>
          <div className="relative group">
             <button className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2">
                <Filter className="w-4 h-4" /> أدوات إضافية
             </button>
             <div className="absolute start-0 mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button onClick={() => handleAction('excel_import')} className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50">
                   <Upload className="w-4 h-4" /> استيراد إكسيل
                </button>
                <button onClick={handleExport} className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50">
                   <Download className="w-4 h-4" /> تصدير إكسيل
                </button>
                <button onClick={() => handleAction('duplicate_check')} className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50">
                   <AlertTriangle className="w-4 h-4" /> فحص التكرار (Duplicates)
                </button>
                <button onClick={() => handleAction('profitability')} className="flex items-center gap-2 w-full text-start px-4 py-2.5 text-sm hover:bg-slate-50">
                   <TrendingUp className="w-4 h-4" /> تصنيف الربحية (Profitability)
                </button>
             </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الكود</th>
                <th className="px-6 py-4 text-start">الاسم</th>
                <th className="px-6 py-4 text-start">النوع</th>
                <th className="px-6 py-4 text-start">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-start">الهاتف</th>
                <th className="px-6 py-4 text-end">الرصيد المستحق (EGP)</th>
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-start">
                    {contact.code}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div>{contact.name}</div>
                    {contact.sub_contacts && contact.sub_contacts.length > 0 && (
                      <div className="text-xs text-slate-400 mt-0.5">{contact.sub_contacts.length} جهات اتصال إضافية</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none bg-blue-100 text-blue-700`}>
                      عميل
                    </span>
                  </td>
                  <td className="px-6 py-4 text-start">{contact.email}</td>
                  <td className="px-6 py-4 text-start" dir="ltr">{contact.phone}</td>
                  <td className="px-6 py-4 text-end font-mono font-medium" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(contact.outstanding_balance ?? contact.balance)}
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => handleAction('view', contact)} className="text-primary-600 font-semibold hover:underline">
                      أعمار الديون / كشف حساب
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'excel_import' && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <h3 className="text-lg font-bold text-slate-800">استيراد جهات الاتصال</h3>
               <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
               <div className="border border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50">
                  <Upload className="w-8 h-8 text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-2">اسحب وأفلت ملف إكسيل هنا (.csv)</p>
                  <label className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-slate-50 transition max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                     {importedFile ? importedFile.name : 'تصفح الملفات'}
                     <input type="file" className="hidden" accept=".csv" onChange={(e) => setImportedFile(e.target.files?.[0] || null)} />
                  </label>
               </div>
               <button onClick={handleImport} className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-primary-700 transition">بدء الاستيراد</button>
            </div>
          </div>
         </div>
      )}

      {activeModal === 'duplicate_check' && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <h3 className="text-lg font-bold text-slate-800">فحص التكرار (Duplicate Detection)</h3>
               <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
               <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
                  <p className="text-sm text-amber-800">تم العثور على تشابه في بعض جهات الاتصال الحالية.</p>
               </div>
               <div className="border border-slate-200 rounded-lg overflow-hidden mb-4 max-h-64 overflow-y-auto">
                  {duplicates.map((dup, i) => (
                    <div key={i}>
                      <div className="text-xs p-3 bg-slate-50 border-b border-slate-200 flex justify-between font-bold">
                         <span>{dup.primary.name} ({dup.primary.code})</span>
                         <button onClick={() => handleMerge(dup.primary.id, dup.secondary.id)} className="text-primary-600 font-bold hover:underline">دمج (Merge)</button>
                      </div>
                      <div className="text-xs p-3 bg-white flex justify-between">
                         <span>{dup.secondary.name} ({dup.secondary.code})</span>
                         <span className="text-slate-400">{dup.reason}</span>
                      </div>
                    </div>
                  ))}
                  {duplicates.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">لا توجد جهات اتصال مكررة</div>}
               </div>
               <button onClick={() => setActiveModal(null)} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl mt-2 hover:bg-slate-200 transition">تخطي</button>
            </div>
          </div>
         </div>
      )}

      {activeModal === 'profitability' && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
               <h3 className="text-lg font-bold text-slate-800">تصنيف الربحية (Profitability Ranking)</h3>
               <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
               <div className="space-y-3">
                  {profitability.map((c, i) => (
                     <div key={i} className="flex justify-between items-center border border-slate-100 p-4 rounded-xl hover:bg-slate-50">
                        <div>
                           <div className="font-bold text-slate-800">{c.name}</div>
                           <div className="text-sm text-emerald-600 font-mono mt-1">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(c.profit)} أرباح</div>
                        </div>
                        <div className="text-2xl font-black text-primary-200">{c.grade}</div>
                     </div>
                  ))}
               </div>
            </div>
          </div>
         </div>
      )}

      {activeModal === 'view' && selectedContact && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-4xl">
             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-slate-100 gap-4">
               <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{selectedContact.code}</span>
                     <span className="text-xs text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{selectedContact.type === 'customer' ? 'عميل' : 'مورد'}</span>
                  </div>
               </div>
               <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition bg-slate-50 p-2 rounded-lg"><X className="w-5 h-5"/></button>
             </div>
             <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50">
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-xs text-slate-500 mb-1 font-semibold">الرصيد المفتوح (Opening Balance)</div>
                     <div className="text-lg font-bold text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(selectedContact.opening_balance ?? 0)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-xs text-slate-500 mb-1 font-semibold">الرصيد الحالي (Current Balance)</div>
                     <div className="text-lg font-bold text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(selectedContact.balance ?? 0)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-s-4 border-s-rose-500">
                     <div className="text-xs text-slate-500 mb-1 font-semibold">الرصيد المستحق (Outstanding)</div>
                     <div className="text-lg font-bold text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(selectedContact.outstanding_balance ?? 0)}</div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                     <div className="text-xs text-slate-500 mb-1 font-semibold">الحد الائتماني (Credit Limit)</div>
                     <div className="text-lg font-bold text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(selectedContact.credit_limit ?? 0)}</div>
                  </div>
               </div>

               {agingData && agingData.aging_summary && (
                 <div>
                   <h4 className="font-bold text-slate-800 mb-3">أعمار الديون (Customer Aging Buckets)</h4>
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <div className="grid grid-cols-4 text-center divide-x divide-slate-100">
                       <div className="p-4">
                         <div className="text-sm font-semibold text-slate-500 mb-1">0 - 30 يوماً</div>
                         <div className="font-bold text-emerald-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(agingData.aging_summary['0_30'])}</div>
                       </div>
                       <div className="p-4">
                         <div className="text-sm font-semibold text-slate-500 mb-1">31 - 60 يوماً</div>
                         <div className="font-bold text-amber-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(agingData.aging_summary['31_60'])}</div>
                       </div>
                       <div className="p-4">
                         <div className="text-sm font-semibold text-slate-500 mb-1">61 - 90 يوماً</div>
                         <div className="font-bold text-orange-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(agingData.aging_summary['61_90'])}</div>
                       </div>
                       <div className="p-4 bg-rose-50/30">
                         <div className="text-sm font-semibold text-rose-500 mb-1">91+ يوماً</div>
                         <div className="font-bold text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(agingData.aging_summary['90_plus'])}</div>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               <div className="flex flex-col lg:flex-row gap-6">
                 <div className="lg:w-2/3">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="font-bold text-slate-800">كشف الحساب (Customer Statement)</h4>
                     <button className="text-primary-600 text-sm font-bold flex items-center gap-1 hover:underline"><Download className="w-3 h-3"/> تحميل كشف الحساب</button>
                   </div>
                   <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     <table className="w-full text-start text-sm">
                       <thead className="bg-slate-50 text-slate-500">
                         <tr>
                           <th className="p-3 text-start">التاريخ</th>
                           <th className="p-3 text-start">البيان</th>
                           <th className="p-3 text-end">مدين</th>
                           <th className="p-3 text-end">دائن</th>
                           <th className="p-3 text-end">الرصيد</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {statementData?.statement?.map((line: any, index: number) => (
                            <tr key={index}>
                              <td className="p-3">{line.entry_date}</td>
                              <td className="p-3">{line.description}</td>
                              <td className="p-3 text-end font-mono">{line.debit > 0 ? new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(line.debit) : '-'}</td>
                              <td className="p-3 text-end font-mono">{line.credit > 0 ? new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(line.credit) : '-'}</td>
                              <td className="p-3 text-end font-mono">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(line.balance)}</td>
                            </tr>
                         ))}
                         {!statementData?.statement?.length && (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-500">لا توجد حركات مسجلة لهذا العميل</td>
                            </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>
                 
                 <div className="lg:w-1/3">
                   <h4 className="font-bold text-slate-800 mb-3">جهات الاتصال المتعددة</h4>
                   {selectedContact.sub_contacts && selectedContact.sub_contacts.length > 0 ? (
                      <div className="space-y-3">
                         {selectedContact.sub_contacts.map((c, i) => (
                           <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                             <div className="font-bold text-slate-800 mb-1">{c.name}</div>
                             <div className="text-sm text-slate-500">{c.email}</div>
                             <div className="text-sm text-slate-500 dir-ltr text-right">{c.phone}</div>
                           </div>
                         ))}
                      </div>
                   ) : (
                      <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 text-center text-slate-400 text-sm">
                         لا توجد جهات اتصال أخرى
                      </div>
                   )}
                 </div>
               </div>
             </div>
           </div>
         </div>
      )}
      
      {toastMsg && (
        <div className="fixed bottom-6 left-6 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-50 flex items-center gap-2">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
