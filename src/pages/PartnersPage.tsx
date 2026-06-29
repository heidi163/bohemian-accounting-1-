import { useEffect, useState } from "react";
import { type PartnerAccount } from "../types";
import { clsx } from "clsx";
import { Briefcase, ArrowUpRight, ArrowDownRight, RefreshCcw, Landmark, PieChart, Plus, X } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function PartnersPage() {
  const [partners, setPartners] = useState<PartnerAccount[]>([]);
  const [activeModal, setActiveModal] = useState<{ partnerId: number, type: 'deposit' | 'withdrawal' | 'capital_injection' } | null>(null);
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txDesc, setTxDesc] = useState<string>('');
  const [expandedPartner, setExpandedPartner] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPartners = () => {
    fetch("/api/partners")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setPartners(data.data))
      .catch(() => {
        const local = localStorage.getItem(getCompanyKey('mock_partners'));
        if (local) {
          setPartners(JSON.parse(local));
        } else {
          const defaultPartners: PartnerAccount[] = [
            { id: 1, partner_name: 'أحمد صلاح', equity_share: 60, capital_balance: 500000, current_balance: 25000, transactions: [{id: 1, date: '2026-01-01', description: 'رأس مال أولي', type: 'capital_injection', amount: 500000}] },
            { id: 2, partner_name: 'محمد عبدالله', equity_share: 40, capital_balance: 333333, current_balance: -5000, transactions: [{id: 2, date: '2026-01-01', description: 'رأس مال أولي', type: 'capital_injection', amount: 333333}, {id: 3, date: '2026-03-15', description: 'مسحوبات شخصية', type: 'withdrawal', amount: 5000}] }
          ];
          localStorage.setItem(getCompanyKey('mock_partners'), JSON.stringify(defaultPartners));
          setPartners(defaultPartners);
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
      setPartners(nextPartners);
      localStorage.setItem(getCompanyKey('mock_partners'), JSON.stringify(nextPartners));
      setActiveModal(null);
      setTxAmount(0);
      setTxDesc('');
      setIsProcessing(false);
    }, 500);
  };

  const totalCapital = partners.reduce((sum, p) => sum + p.capital_balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">حسابات الشركاء (Partners Accounts)</h2>
          <p className="text-slate-500 mt-1">إدارة رأس المال، الجاري، المسحوبات والإيداعات للشركاء.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <PieChart className="w-5 h-5" />
             </div>
             <div className="font-bold text-slate-800">إجمالي رأس المال المستثمر</div>
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono" dir="ltr">
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
                     <h3 className="font-bold text-lg text-slate-900">{partner.partner_name}</h3>
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
                     <div className={clsx("font-mono font-black text-2xl", partner.current_balance >= 0 ? 'text-emerald-600' : 'text-rose-600')} dir="ltr">
                        {new Intl.NumberFormat('ar-EG').format(partner.current_balance)}
                     </div>
                     <div className="text-xs text-slate-400 mt-1">{partner.current_balance >= 0 ? 'دائن للشريك (له)' : 'مدين على الشريك (عليه)'}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button onClick={() => { setActiveModal({ partnerId: partner.id, type: 'deposit' }); setErrorMsg(''); }} className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1">
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
                                 <td className={clsx("px-3 py-2 text-end font-mono font-bold", tx.type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600')} dir="ltr">
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
                     activeModal.type === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}
                 >
                   {isProcessing ? 'جاري التنفيذ...' : 'تأكيد وإنشاء القيد (Confirm & Post)'}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
