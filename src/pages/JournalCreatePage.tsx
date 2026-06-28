import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function JournalCreatePage() {
  const navigate = useNavigate();
  const [header, setHeader] = useState({
    company_id: "BGK",
    entry_date: new Date().toISOString().split('T')[0],
    status: "draft",
    description: "",
    currency: "EGP",
    exchange_rate: 1.0
  });
  const [lines, setLines] = useState([
    { id: 1, account: "", description: "", debit: 0, credit: 0 },
    { id: 2, account: "", description: "", debit: 0, credit: 0 },
  ]);

  const addLine = () => {
    setLines([...lines, { id: Date.now(), account: "", description: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (id: number) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const updateLine = (id: number, field: string, value: string | number) => {
    setLines(prevLines => prevLines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const totalDebit = lines.reduce((acc, line) => acc + Number(line.debit || 0), 0);
  const totalCredit = lines.reduce((acc, line) => acc + Number(line.credit || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSave = async () => {
    if (!isBalanced) return;
    
    // We get values from the form. In a real app we'd use controlled components for all fields.
    // For this prototype, we'll construct a basic payload from what we have.
    const payload = {
      entry_number: 'JE-2026-00004',
      entry_date: header.entry_date,
      description: header.description || 'قيد يومية جديد',
      total_debit: totalDebit,
      total_credit: totalCredit,
      status: header.status,
      company_id: header.company_id,
      currency: header.currency,
      exchange_rate: header.exchange_rate,
      base_total_debit: totalDebit * header.exchange_rate,
      base_total_credit: totalCredit * header.exchange_rate
    };

    const localJournals = JSON.parse(localStorage.getItem(getCompanyKey('mock_journals')) || '[]');
    if (localJournals.length === 0) {
      localJournals.push(
        { id: 1, entry_number: 'JE-2026-00001', entry_date: '2026-05-01', description: 'رصيد افتتاحي', total_debit: 500000, total_credit: 500000, status: 'posted', company_id: 'BGK' },
        { id: 2, entry_number: 'JE-2026-00002', entry_date: '2026-05-15', description: 'إثبات رواتب شهر مايو', total_debit: 45000, total_credit: 45000, status: 'posted', company_id: 'BGK' },
        { id: 3, entry_number: 'JE-2026-00003', entry_date: '2026-06-01', description: 'تسوية عهدة موظف', total_debit: 1200, total_credit: 1200, status: 'pending_approval', company_id: 'O2N' }
      );
    }
    const newEntry = { ...payload, id: Date.now(), entry_number: `JE-2026-${String(localJournals.length + 1).padStart(5, '0')}` };
    localJournals.unshift(newEntry);
    localStorage.setItem(getCompanyKey('mock_journals'), JSON.stringify(localJournals));
    
    alert('تم حفظ قيد اليومية بنجاح!');
    navigate('/journal');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/journal')} className="text-slate-400 hover:text-slate-600 transition">
            <ArrowRight className="w-6 h-6 " />
          </button>
          <h2 className="font-bold text-slate-800 text-lg">إنشاء قيد يومية جديد</h2>
        </div>
        <button 
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition ${isBalanced ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`} 
          onClick={handleSave}
          disabled={!isBalanced}
        >
          حفظ القيد
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم القيد</label>
            <input type="text" defaultValue="JE-2026-00004" disabled className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الشركة</label>
            <select value={header.company_id} onChange={e => setHeader({...header, company_id: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
              <option value="" disabled>اختر الشركة...</option>
              <option value="BGK">بوهيميان جيكس (BGK)</option>
              <option value="O2N">أو تو نيشن (O2N)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">التاريخ</label>
            <input type="date" value={header.entry_date} onChange={e => setHeader({...header, entry_date: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">الحالة</label>
             <select value={header.status} onChange={e => setHeader({...header, status: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
               <option value="draft">مسودة (Draft)</option>
               <option value="pending_approval">في انتظار الموافقة</option>
               <option value="posted">مُرحل (Posted)</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">العملة</label>
             <select value={header.currency} onChange={e => setHeader({...header, currency: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
               <option value="EGP">EGP (جنيه مصري)</option>
               <option value="USD">USD (دولار أمريكي)</option>
               <option value="EUR">EUR (يورو)</option>
               <option value="GBP">GBP (جنيه إسترليني)</option>
             </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">سعر الصرف</label>
             <input type="number" value={header.exchange_rate} disabled={header.currency === 'EGP'} onChange={e => setHeader({...header, exchange_rate: Number(e.target.value)})} className="w-full bg-white border border-slate-200 disabled:bg-slate-50 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
          </div>
          <div className="md:col-span-3 xl:col-span-6">
             <label className="block text-sm font-medium text-slate-700 mb-2">وصف القيد</label>
             <input type="text" value={header.description} onChange={e => setHeader({...header, description: e.target.value})} placeholder="مثال: إثبات إيرادات مبيعات وتوريدات شهر مايو..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">تفاصيل القيود</h3>
            <button onClick={addLine} className="flex items-center space-x-2  text-primary-600 font-semibold text-sm hover:text-primary-700">
              <Plus className="w-4 h-4" />
              <span>إضافة سطر</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start w-1/4">الحساب</th>
                  <th className="px-4 py-3 text-start w-1/3">البيان</th>
                  <th className="px-4 py-3 text-start w-32">مدين</th>
                  <th className="px-4 py-3 text-start w-32">دائن</th>
                  <th className="px-4 py-3 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {lines.map((line) => (
                  <tr key={line.id} className="bg-white hover:bg-slate-50 transition-colors">
                    <td className="p-2">
                       <select 
                        value={line.account}
                        onChange={(e) => updateLine(line.id, 'account', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors"
                       >
                         <option value="" disabled>اختر حساب...</option>
                         <option value="1111">البنك الأهلي - EGP (1111)</option>
                         <option value="1210">العملاء - محلي (1210)</option>
                         <option value="2100">الموردين (2100)</option>
                         <option value="5100">إيرادات تسويق (5100)</option>
                         <option value="7100">مصروفات رواتب (7100)</option>
                       </select>
                    </td>
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="البيان..."
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0"
                        value={line.debit || ''}
                        onChange={(e) => {
                          updateLine(line.id, 'debit', Number(e.target.value));
                          if (Number(e.target.value) > 0) updateLine(line.id, 'credit', 0);
                        }}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors text-start"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0"
                        value={line.credit || ''}
                        onChange={(e) => {
                          updateLine(line.id, 'credit', Number(e.target.value));
                          if (Number(e.target.value) > 0) updateLine(line.id, 'debit', 0);
                        }}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors text-start"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-end font-semibold text-slate-700">
                    الإجمالي ({header.currency})
                    {header.currency !== 'EGP' && <div className="text-xs text-slate-500 font-normal">المعادل بالأساس (EGP)</div>}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900" dir="ltr">
                    <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: header.currency }).format(totalDebit)}</div>
                    {header.currency !== 'EGP' && <div className="text-xs text-slate-500">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(totalDebit * header.exchange_rate)}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900" dir="ltr">
                    <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: header.currency }).format(totalCredit)}</div>
                    {header.currency !== 'EGP' && <div className="text-xs text-slate-500">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(totalCredit * header.exchange_rate)}</div>}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
            <p className="text-red-500 text-sm mt-3 font-medium">الرجاء التأكد من توازن القيد (إجمالي المدين يجب أن يساوي إجمالي الدائن).</p>
          )}
        </div>
      </div>
    </div>
  );
}
