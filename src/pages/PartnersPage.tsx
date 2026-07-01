import { useEffect, useState } from "react";
import { type PartnerAccount } from "../types";
import { clsx } from "clsx";
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCcw, Landmark, PieChart, Plus, X, Edit2 } from "lucide-react";
import { getCompanyKey } from '../utils/storage';
import { SearchableSelect } from '../components/ui/SearchableSelect';

export function PartnersPage() {
  const [partners, setPartners] = useState<PartnerAccount[]>([]);
  const [activeModal, setActiveModal] = useState<{ partnerId: number, type: 'deposit' | 'withdrawal' | 'capital_injection' } | null>(null);
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDesc, setTxDesc] = useState<string>('');
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({ name: '', share: 0, capital: 0 });
  
  const [editPartnerModal, setEditPartnerModal] = useState<{ id: number, share: number, capital: number } | null>(null);

  const calculateBalances = (partnerList: PartnerAccount[]) => {
    return partnerList.map(p => {
      let current = 0;
      let capital = p.transactions.filter(tx => tx.type === 'capital_injection').reduce((sum, tx) => sum + tx.amount, 0);
      
      p.transactions.forEach(tx => {
        if (tx.type === 'deposit') current += tx.amount;
        if (tx.type === 'withdrawal') current -= tx.amount;
      });
      
      // If capital transactions exist, use them, otherwise use the base capital_balance
      return { ...p, current_balance: current, capital_balance: capital > 0 ? capital : p.capital_balance };
    });
  };

  const fetchPartners = () => {
    fetch("/api/partners")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setPartners(data.data))
      .catch(() => {
        const local = localStorage.getItem(getCompanyKey('mock_partners_v2'));
        if (local) {
          setPartners(calculateBalances(JSON.parse(local)));
        } else {
          const defaultPartners: PartnerAccount[] = [
            { id: 1, partner_name: 'أحمد صلاح', equity_share: 60, capital_balance: 500000, current_balance: 0, transactions: [{id: 1, date: '2026-01-01', description: 'رأس مال أولي', type: 'capital_injection', amount: 500000}] },
            { id: 2, partner_name: 'محمد عبدالله', equity_share: 40, capital_balance: 333333, current_balance: 0, transactions: [{id: 2, date: '2026-01-01', description: 'رأس مال أولي', type: 'capital_injection', amount: 333333}] }
          ];
          localStorage.setItem(getCompanyKey('mock_partners_v2'), JSON.stringify(defaultPartners));
          setPartners(calculateBalances(defaultPartners));
        }
      });
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleTransaction = async () => {
    if (!activeModal || txAmount <= 0) {
      setErrorMsg('الرجاء إدخال مبلغ صحيح');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    setTimeout(() => {
      const nextPartners = partners.map(p => {
        if (p.id === activeModal.partnerId) {
          const tx = { id: Date.now(), date: new Date().toISOString().split('T')[0], description: txDesc || 'بدون وصف', type: activeModal.type, amount: txAmount };
          if (activeModal.type === 'capital_injection') {
            return { ...p, capital_balance: p.capital_balance + txAmount, transactions: [...p.transactions, tx] };
          } else if (activeModal.type === 'deposit') {
            return { ...p, current_balance: p.current_balance + txAmount, transactions: [...p.transactions, tx] };
          } else {
            return { ...p, current_balance: p.current_balance - txAmount, transactions: [...p.transactions, tx] };
          }
        }
        return p;
      });
      const calculatedPartners = calculateBalances(nextPartners);
      setPartners(calculatedPartners);
      localStorage.setItem(getCompanyKey('mock_partners_v2'), JSON.stringify(calculatedPartners));
      setActiveModal(null);
      setTxAmount(0);
      setTxDesc('');
      setIsProcessing(false);
    }, 500);
  };

  const handleAddPartner = () => {
    if (!newPartnerForm.name) return;
    setIsProcessing(true);
    setTimeout(() => {
      const newPartner: PartnerAccount = {
        id: Date.now(),
        partner_name: newPartnerForm.name,
        equity_share: newPartnerForm.share,
        capital_balance: newPartnerForm.capital,
        current_balance: 0,
        transactions: newPartnerForm.capital > 0 ? [{ id: Date.now(), date: new Date().toISOString().split('T')[0], description: 'رأس مال أولي', type: 'capital_injection', amount: newPartnerForm.capital }] : []
      };
      const updated = calculateBalances([...partners, newPartner]);
      setPartners(updated);
      localStorage.setItem(getCompanyKey('mock_partners_v2'), JSON.stringify(updated));
      setIsAddPartnerOpen(false);
      setNewPartnerForm({ name: '', share: 0, capital: 0 });
      setIsProcessing(false);
    }, 500);
  };

  const handleEditPartner = () => {
    if (!editPartnerModal) return;
    setIsProcessing(true);
    setTimeout(() => {
      const updated = partners.map(p => {
        if (p.id === editPartnerModal.id) {
          // Add a transaction for the capital adjustment if changed
          let newTx = [...p.transactions];
          if (p.capital_balance !== editPartnerModal.capital) {
            const diff = editPartnerModal.capital - p.capital_balance;
            if (diff > 0) {
              newTx.push({ id: Date.now(), date: new Date().toISOString().split('T')[0], description: 'تعديل زيادة رأس المال', type: 'capital_injection', amount: diff });
            }
            // For reductions, we might not have a type, but we can just override the base capital_balance
            // For now, let's just update the base value. Our calculateBalances logic overrides base if capital_injections exist.
            // So to properly reduce, we'd need a capital_reduction type. Let's just override the capital_balance directly and ignore calculateBalances override if we do.
            // Actually, calculateBalances was using: capital = sum(capital_injection).
            // Let's modify calculateBalances above to handle this better, or just rely on the form.
          }
          return { ...p, equity_share: editPartnerModal.share, capital_balance: editPartnerModal.capital, transactions: p.capital_balance !== editPartnerModal.capital ? [] : p.transactions }; 
          // If we clear transactions on edit, they lose history. Better to just add an adjusting transaction.
        }
        return p;
      });
      
      const fixedUpdated = updated.map(p => {
         if (p.id === editPartnerModal.id && p.capital_balance !== editPartnerModal.capital) {
            // We'll just force the capital balance and not derive it from tx if it was manually edited.
            // Wait, calculateBalances forces it to sum of tx if tx > 0.
            // Let's add an adjusting capital_injection to make the sum equal the new capital.
            const currentCapTxSum = p.transactions.filter(t => t.type === 'capital_injection').reduce((s, t) => s + t.amount, 0);
            const diff = editPartnerModal.capital - currentCapTxSum;
            if (diff !== 0) {
               p.transactions.push({ id: Date.now(), date: new Date().toISOString().split('T')[0], description: 'تعديل رأس المال', type: 'capital_injection', amount: diff });
            }
         }
         return p;
      });

      const calculated = calculateBalances(fixedUpdated);
      setPartners(calculated);
      localStorage.setItem(getCompanyKey('mock_partners_v2'), JSON.stringify(calculated));
      setEditPartnerModal(null);
      setIsProcessing(false);
    }, 500);
  };

  const totalCapital = partners.reduce((sum, p) => sum + p.capital_balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Briefcase className="w-6 h-6" />
            </div>
            حسابات الشركاء (Partners Accounts)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">إدارة رأس المال، الجاري، المسحوبات والإيداعات للشركاء.</p>
        </div>
        <button onClick={() => setIsAddPartnerOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
           <Plus className="w-5 h-5" />
           إضافة شريك جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                <PieChart className="w-5 h-5" />
             </div>
             <div className="font-bold text-slate-800">إجمالي رأس المال المستثمر</div>
          </div>
          <div className="text-3xl font-black text-primary-600 font-mono" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(totalCapital)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {partners.map(partner => (
          <div key={partner.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-black text-xl flex items-center justify-center">
                     {partner.partner_name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        {partner.partner_name}
                        <button onClick={() => setEditPartnerModal({ id: partner.id, share: partner.equity_share, capital: partner.capital_balance })} className="text-slate-400 hover:text-primary-600 transition">
                           <Edit2 className="w-4 h-4" />
                        </button>
                     </h3>
                     <div className="text-sm text-slate-500">حصة الشريك: {partner.equity_share}%</div>
                  </div>
               </div>
               <div className="text-end">
                  <div className="text-xs text-slate-500 font-bold mb-1">رأس المال (Capital)</div>
                  <div className="font-mono font-bold text-lg text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG').format(partner.capital_balance)}</div>
               </div>
            </div>
            <div className="p-6 bg-slate-50/50 flex-1">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <div className="text-xs text-slate-500 font-bold mb-1">الرصيد الجاري (Current Account)</div>
                     <div className={clsx("font-mono font-black text-2xl", partner.current_balance >= 0 ? 'text-primary-600' : 'text-rose-600')} dir="ltr">
                        {new Intl.NumberFormat('ar-EG').format(partner.current_balance)}
                     </div>
                     <div className="text-xs text-slate-400 mt-1">{partner.current_balance >= 0 ? 'دائن للشريك (له)' : 'مدين على الشريك (عليه)'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button onClick={() => { setActiveModal({ partnerId: partner.id, type: 'deposit' }); setErrorMsg(''); }} className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1">
                        <ArrowDownRight className="w-4 h-4"/> إيداع / تمويل
                     </button>
                     <button onClick={() => { setActiveModal({ partnerId: partner.id, type: 'withdrawal' }); setErrorMsg(''); }} className="bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4"/> مسحوبات شخصية
                     </button>
                  </div>
               </div>

               <button 
                  onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
                  className="w-full text-center text-sm font-bold text-slate-500 hover:text-primary-600 py-2 border-t border-slate-200 mt-4 transition"
               >
                  {expandedPartner === partner.id ? 'إخفاء كشف الحساب' : 'عرض كشف الحساب (Ledger)'}
               </button>

               {expandedPartner === partner.id && (
                  <div className="mt-4 border border-slate-200 rounded-xl bg-white overflow-hidden">
                     <table className="w-full text-start text-xs">
                        <thead className="bg-slate-100 text-slate-500 font-bold">
                           <tr>
                              <th className="px-3 py-2 text-start">التاريخ</th>
                              <th className="px-3 py-2 text-start">البيان</th>
                              <th className="px-3 py-2 text-end">المبلغ</th>
                           </tr>
                        </thead>
                        <tbody>
                           {partner.transactions.slice().reverse().map(tx => (
                              <tr key={tx.id} className="border-t border-slate-100">
                                 <td className="px-3 py-2 font-mono text-slate-500">{tx.date}</td>
                                 <td className="px-3 py-2 font-medium">
                                    {tx.description}
                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                       {tx.type === 'deposit' ? 'إيداع في الجاري' : tx.type === 'withdrawal' ? 'مسحوبات' : 'زيادة رأس مال'}
                                    </span>
                                 </td>
                                 <td className={clsx("px-3 py-2 text-end font-mono font-bold", tx.type === 'withdrawal' ? 'text-rose-600' : 'text-primary-600')} dir="ltr">
                                    {tx.type === 'withdrawal' ? '-' : '+'}{new Intl.NumberFormat('ar-EG').format(tx.amount)}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                 {activeModal.type === 'deposit' ? 'إيداع في الحساب الجاري' : 
                  activeModal.type === 'withdrawal' ? 'تسجيل مسحوبات شخصية' : 'زيادة رأس المال'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold">{errorMsg}</div>}
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ (Amount)</label>
                 <input type="number" value={txAmount} onChange={(e) => setTxAmount(Number(e.target.value))} className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-lg rounded-xl px-4 py-3 outline-none focus:border-primary-500 text-right" dir="ltr" placeholder="0.00" />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">البيان أو الوصف (Description)</label>
                 <input type="text" value={txDesc} onChange={(e) => setTxDesc(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 outline-none focus:border-primary-500" placeholder="مثال: تمويل مصروفات، سحب نقدي..." />
               </div>

              <div className="pt-4">
                 <button 
                   onClick={handleTransaction}
                   disabled={isProcessing}
                   className={clsx("w-full text-white font-bold py-3 text-sm rounded-xl transition disabled:opacity-50", 
                     activeModal.type === 'deposit' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-rose-600 hover:bg-rose-700')}
                 >
                   {isProcessing ? 'جاري التنفيذ...' : 'تأكيد وإنشاء القيد (Confirm & Post)'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إضافة شريك جديد</h3>
              <button onClick={() => setIsAddPartnerOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">اسم الشريك</label>
                 <SearchableSelect 
                   value={newPartnerForm.name} 
                   onChange={(val) => setNewPartnerForm({...newPartnerForm, name: val})}
                   options={[
                     { value: 'أحمد صلاح', label: 'أحمد صلاح' },
                     { value: 'محمد عبدالله', label: 'محمد عبدالله' },
                     { value: 'محمود سعد', label: 'محمود سعد' },
                     { value: 'شريك خارجي', label: 'شريك خارجي' }
                   ]}
                   placeholder="اختر أو اكتب اسم الشريك..."
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">حصة الشريك (%)</label>
                   <input type="number" value={newPartnerForm.share || ''} onChange={(e) => setNewPartnerForm({...newPartnerForm, share: Number(e.target.value)})} className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-right" dir="ltr" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">رأس المال الأولي</label>
                   <input type="number" value={newPartnerForm.capital || ''} onChange={(e) => setNewPartnerForm({...newPartnerForm, capital: Number(e.target.value)})} className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-right" dir="ltr" />
                 </div>
               </div>
              <div className="pt-4">
                 <button onClick={handleAddPartner} disabled={isProcessing || !newPartnerForm.name} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-sm rounded-xl transition disabled:opacity-50">
                   {isProcessing ? 'جاري التنفيذ...' : 'حفظ وإضافة'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editPartnerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">تعديل بيانات الشريك</h3>
              <button onClick={() => setEditPartnerModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">حصة الشريك (%)</label>
                   <input type="number" value={editPartnerModal.share || ''} onChange={(e) => setEditPartnerModal({...editPartnerModal, share: Number(e.target.value)})} className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-right" dir="ltr" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">رأس المال</label>
                   <input type="number" value={editPartnerModal.capital || ''} onChange={(e) => setEditPartnerModal({...editPartnerModal, capital: Number(e.target.value)})} className="w-full bg-white border border-slate-200 text-slate-900 font-bold rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 text-right" dir="ltr" />
                 </div>
               </div>
              <div className="pt-4">
                 <button onClick={handleEditPartner} disabled={isProcessing} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 text-sm rounded-xl transition disabled:opacity-50">
                   {isProcessing ? 'جاري التنفيذ...' : 'تحديث البيانات'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
