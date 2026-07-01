import { useEffect, useState } from "react";
import { type BankAccount } from "../types";
import { useNavigate } from "react-router";
import { Building2, Landmark, Wallet, ArrowRightLeft, ArrowDownToLine, ArrowUpFromLine, RefreshCcw, FileUp, Filter , X} from "lucide-react";
import { clsx } from "clsx";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

export function BanksPage() {
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [activeModal, setActiveModal] = useState<null | 'deposit' | 'withdraw' | 'transfer' | 'reconcile'>(null);
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  
  const [transferForm, setTransferForm] = useState({ fromBankId: '', toBankId: '', amount: 0, exchangeRate: 1.0, memo: '' });
  const [transactionForm, setTransactionForm] = useState({ amount: 0 });
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };
  
  const navigate = useNavigate();

  const fetchBanks = () => {
    fetch("/api/banks", { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => {
        const activeCompany = getActiveCompany();
        setBanks(data.data.filter((b: BankAccount) => b.company_id === 'ALL' || b.company_id === activeCompany));
      })
      .catch(() => {
        const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
        const activeCompany = getActiveCompany();
        if (localBanks.length > 0) {
          setBanks(localBanks.filter((b: BankAccount) => b.company_id === 'ALL' || b.company_id === activeCompany));
        } else {
            const defaults = [
            { id: "1", code: "1111", name: "البنك الأهلي - EGP", type: "bank", currency: "EGP", balance: 1500000, company_id: "BGK" },
            { id: "2", code: "1112", name: "بنك الراجحي - SAR", type: "bank", currency: "SAR", balance: 250000, company_id: "BGK" },
            { id: "3", code: "1113", name: "CIB - USD", type: "bank", currency: "USD", balance: 45000, company_id: "O2N" },
            { id: "4", code: "1121", name: "صندوق المركز الرئيسي", type: "cash", currency: "EGP", balance: 25000, company_id: "ALL" }
          ];
          localStorage.setItem(getCompanyKey('mock_banks'), JSON.stringify(defaults));
          setBanks(defaults.filter((b: BankAccount) => b.company_id === 'ALL' || b.company_id === activeCompany));
        }
      });
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleTransaction = async (type: string) => {
    const payload = {
      type,
      amount: type === 'transfer' ? transferForm.amount : transactionForm.amount,
      fromBankId: transferForm.fromBankId || selectedBank?.id,
      toBankId: transferForm.toBankId,
      bankId: selectedBank?.id,
      memo: transferForm.memo,
      exchangeRate: transferForm.exchangeRate
    };

    if (type === 'transfer' && (!payload.fromBankId || !payload.toBankId || payload.amount <= 0)) {
      setErrorMsg('الرجاء تعبئة جميع بيانات التحويل (الحسابين والمبلغ)');
      return;
    }
    
    if (type === 'transfer' && payload.fromBankId === payload.toBankId) {
      setErrorMsg('لا يمكن التحويل لنفس الحساب');
      return;
    }

    if ((type === 'deposit' || type === 'withdraw') && (!payload.amount || payload.amount <= 0)) {
      setErrorMsg('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    setTimeout(() => {
      const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
      let success = false;
      
      if (type === 'transfer') {
        const fromBank = localBanks.find((b: any) => b.id === payload.fromBankId);
        const toBank = localBanks.find((b: any) => b.id === payload.toBankId);
        if (fromBank && toBank) {
          fromBank.balance -= payload.amount;
          toBank.balance += (payload.amount * payload.exchangeRate);
          success = true;
        }
      } else if (type === 'deposit') {
        const bank = localBanks.find((b: any) => b.id === payload.bankId);
        if (bank) {
          bank.balance += payload.amount;
          success = true;
        }
      } else if (type === 'withdraw') {
        const bank = localBanks.find((b: any) => b.id === payload.bankId);
        if (bank) {
          bank.balance -= payload.amount;
          success = true;
        }
      }

      if (success) {
        localStorage.setItem(getCompanyKey('mock_banks'), JSON.stringify(localBanks));
        setBanks(localBanks);
        setActiveModal(null);
        setTransferForm({ fromBankId: '', toBankId: '', amount: 0, exchangeRate: 1.0, memo: '' });
        setTransactionForm({ amount: 0 });
        showToast(type === 'transfer' ? 'تم تحويل المبلغ بنجاح ' : type === 'deposit' ? 'تم تسجيل الإيداع بنجاح ' : 'تم تسجيل السحب بنجاح ');
      } else {
        setErrorMsg('حدث خطأ أثناء تنفيذ العملية');
      }
      setIsProcessing(false);
    }, 500);
  };

  const handleAction = (type: 'deposit' | 'withdraw' | 'transfer' | 'reconcile', bank?: BankAccount) => {
    setActiveModal(type);
    setErrorMsg('');
    if (bank) setSelectedBank(bank);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Actions */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h1 className="text-2xl font-bold text-slate-800">البنوك والنقد (Banking & Cash)</h1>
          <p className="text-slate-500 mt-1">إدارة الحسابات البنكية، الخزينة، الحركات البنكية والمطابقات.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/banks/new')} className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
            إضافة حساب جديد
          </button>
          <button onClick={() => handleAction('transfer')} className="bg-slate-50 border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> تحويل (Transfer)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {banks.map((bank) => (
          <div key={bank.id} className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 p-6 hover:-translate-y-1 transition-transform duration-300 group relative overflow-hidden flex flex-col justify-between">

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 ">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bank.type === 'bank' ? 'bg-slate-50 text-slate-600 border border-slate-100' : 'bg-primary-50 text-primary-600 border border-primary-100'}`}>
                    {bank.type === 'bank' ? <Landmark className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{bank.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{bank.code}</span>
                      <span className="text-xs bg-primary-50 text-primary-700 font-bold px-1.5 py-0.5 rounded border border-primary-100">{bank.company_id || 'ALL'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">الرصيد الدفتري</div>
                  <div className="text-2xl font-black text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: bank.currency }).format(bank.balance)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                 <button onClick={() => handleAction('deposit', bank)} title="إيداع (Deposit)" className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-600 rounded-lg transition-colors group/btn">
                   <ArrowDownToLine className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                   <span className="text-[10px] font-bold">إيداع</span>
                 </button>
                 <button onClick={() => handleAction('withdraw', bank)} title="سحب (Withdraw)" className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-lg transition-colors group/btn">
                   <ArrowUpFromLine className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                   <span className="text-[10px] font-bold">سحب</span>
                 </button>
                 <button onClick={() => handleAction('transfer', bank)} title="تحويل (Transfer)" className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-slate-50 hover:text-slate-700 text-slate-600 rounded-lg transition-colors group/btn">
                   <ArrowRightLeft className="w-4 h-4" />
                   <span className="text-[10px] font-bold">تحويل</span>
                 </button>
                 {bank.type === 'bank' && (
                   <button onClick={() => handleAction('reconcile', bank)} title="مطابقة (Reconcile)" className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-600 rounded-lg transition-colors group/btn">
                     <FileUp className="w-4 h-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                     <span className="text-[10px] font-bold">مطابقة</span>
                   </button>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal === 'transfer' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">تحويل بين الحسابات / البنوك (Transfer)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold">{errorMsg}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">من حساب (المُحول)</label>
                  <select value={transferForm.fromBankId || selectedBank?.id || ''} onChange={e => setTransferForm({...transferForm, fromBankId: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none">
                    <option value="" disabled>اختر الحساب...</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.currency})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">إلى حساب (المستفيد)</label>
                  <select value={transferForm.toBankId} onChange={e => setTransferForm({...transferForm, toBankId: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none">
                     <option value="" disabled>اختر الحساب...</option>
                     {banks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.currency})</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ (Amount)</label>
                <input type="number" value={transferForm.amount || ''} onChange={e => setTransferForm({...transferForm, amount: Number(e.target.value)})} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none text-right" dir="ltr" />
              </div>
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                 <div className="text-sm font-medium text-slate-800 mb-2">معلومات التحويل متعدد العملات (إذا لزم الأمر):</div>
                 <div className="flex gap-4 items-center">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">سعر الصرف (Exchange Rate)</label>
                      <input type="number" value={transferForm.exchangeRate || ''} onChange={e => setTransferForm({...transferForm, exchangeRate: Number(e.target.value)})} placeholder="1.0" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-lg px-3 py-2 outline-none text-right" dir="ltr" />
                    </div>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">البيان (Memo)</label>
                <input type="text" value={transferForm.memo} onChange={e => setTransferForm({...transferForm, memo: e.target.value})} placeholder="مثال: Internal transfer from BGK EGP to USD..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div className="pt-4">
                <button disabled={isProcessing} onClick={() => handleTransaction('transfer')} className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-primary-700 transition disabled:opacity-50">
                  {isProcessing ? 'جاري التحويل...' : 'تسجيل التحويل'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeModal === 'deposit' || activeModal === 'withdraw') && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {activeModal === 'deposit' ? 'إيداع بنكي / نقدي (Deposit)' : 'سحب بنكي / نقدي (Withdrawal)'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
               {errorMsg && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-bold">{errorMsg}</div>}
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الحساب المحدد</label>
                  <input type="text" disabled value={`${selectedBank?.name} (${selectedBank?.currency})`} className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl px-4 py-2.5 outline-none" />
               </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ (Amount)</label>
                <input type="number" value={transactionForm.amount || ''} onChange={e => setTransactionForm({...transactionForm, amount: Number(e.target.value)})} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none text-right" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">حساب المقابل (Offset Account)</label>
                <select className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none">
                     <option value="" disabled selected>اختر حساب شجرة الحسابات...</option>
                     <option value="4">إيرادات مبيعات</option>
                     <option value="5">مصروفات عمومية وإدارية</option>
                     <option value="2">جاري شركاء</option>
                  </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المرجع / البيان (Reference)</label>
                <input type="text" placeholder="مثال: إيداع نقدي..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div className="pt-4">
                <button disabled={isProcessing} onClick={() => handleTransaction(activeModal)} className={clsx("w-full text-white py-3 rounded-xl text-sm font-bold transition disabled:opacity-50", activeModal === 'deposit' ? 'bg-primary-600 hover:bg-primary-700' : 'bg-rose-600 hover:bg-rose-700')}>
                  {isProcessing ? 'جاري التسجيل...' : (activeModal === 'deposit' ? 'تسجيل الإيداع' : 'تسجيل السحب')}
                </button>
              </div>
            </div>
          </div>
         </div>
      )}

      {activeModal === 'reconcile' && (
         <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">مطابقة كشف الحساب (Bank Reconciliation)</h3>
                <p className="text-sm text-slate-500 mt-1">{selectedBank?.name} - {selectedBank?.company_id}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500 transition bg-white p-2 border border-slate-200 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="bg-violet-50 text-violet-800 p-4 rounded-xl border border-violet-100 flex items-start gap-3">
                 <FileUp className="w-5 h-5 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="font-bold mb-1">استيراد كشف الحساب (Statement Import)</h4>
                    <p className="text-sm opacity-90 mb-3">قم برفع ملف Excel أو CSV الخاص بكشف حساب البنك لتتم مطابقته تلقائياً مع الحركات المسجلة.</p>
                    <input type="file" accept=".csv, .xlsx" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200 outline-none cursor-pointer" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="text-sm text-slate-500 mb-1">رصيد كشف الحساب (Statement Balance)</div>
                  <input type="number" defaultValue={selectedBank?.balance} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-lg font-bold rounded-lg px-3 py-2 outline-none text-right" dir="ltr" />
                </div>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="text-sm text-slate-500 mb-1">رصيد الدفاتر (System Balance)</div>
                  <div className="text-lg font-bold text-slate-900" dir="ltr">{selectedBank?.balance.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">حركات غير مطابقة (Unreconciled Items)</h4>
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  لا توجد حركات معلقة للمطابقة.
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setActiveModal(null); }} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition">تأجيل المطابقة</button>
                <button onClick={() => { setActiveModal(null); }} className="flex-1 bg-violet-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-violet-700 transition">إتمام المطابقة (Finish Reconcile)</button>
              </div>
            </div>
          </div>
         </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

