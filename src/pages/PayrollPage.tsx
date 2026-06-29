import { useEffect, useState } from "react";
import { type PayrollRun } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { PlayCircle, Download, Send, CheckCircle2, FileText, Banknote, X, RefreshCw } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([]);
  const [banks, setBanks] = useState<{id: number, name: string, currency: string}[]>([]);
  const [activeModal, setActiveModal] = useState<null | 'new_run' | 'taxes_insurance'>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTaxesPaid, setIsTaxesPaid] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const fetchPayrolls = () => {
    fetch("/api/payrolls")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setPayrolls(data.data))
      .catch(() => {
        const localPayrolls = JSON.parse(localStorage.getItem(getCompanyKey('mock_payrolls')) || '[]');
        if (localPayrolls.length > 0) {
          setPayrolls(localPayrolls);
        } else {
          const defaults = [
            { id: 1, period: "2026-05", date: "2026-05-28", total_basic: 70000, total_allowances: 15000, total_bonuses: 4000, total_deductions: 2000, total_taxes: 8000, total_social_insurance: 7700, net_salary: 71300, status: "paid" }
          ];
          localStorage.setItem(getCompanyKey('mock_payrolls'), JSON.stringify(defaults));
          setPayrolls(defaults);
        }
      });
  };

  useEffect(() => {
    fetchPayrolls();
    const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
    if (localBanks.length > 0) {
      setBanks(localBanks);
      setSelectedBankId(localBanks[0].id.toString());
    } else {
      fetch("/api/banks").then(res => res.json()).then(data => {
        setBanks(data.data);
        if (data.data.length > 0) setSelectedBankId(data.data[0].id.toString());
      }).catch(console.error);
    }
  }, []);

  const handleCreateRun = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const localPayrolls = JSON.parse(localStorage.getItem(getCompanyKey('mock_payrolls')) || '[]');
      const newRun = {
        id: Date.now(),
        period: selectedMonth,
        date: new Date().toISOString().split('T')[0],
        total_basic: 70000,
        total_allowances: 15000,
        total_bonuses: 0,
        total_deductions: 0,
        total_taxes: 8000,
        total_social_insurance: 7700,
        net_salary: 70000 + 15000 - 8000 - 7700,
        status: 'under_review'
      };
      localPayrolls.push(newRun);
      localStorage.setItem(getCompanyKey('mock_payrolls'), JSON.stringify(localPayrolls));
      
      setPayrolls(localPayrolls);
      setActiveModal(null);
      showToast('تم إعداد مسير الرواتب بنجاح ');
      setIsProcessing(false);
    }, 1000);
  };

  const handlePayTaxes = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
      const bank = localBanks.find((b: any) => b.id === selectedBankId);
      if (bank) {
        bank.balance -= 15700;
        localStorage.setItem(getCompanyKey('mock_banks'), JSON.stringify(localBanks));
      }
      setActiveModal(null);
      setIsTaxesPaid(true);
      showToast('تم سداد ضرائب وتأمينات الرواتب بنجاح ');
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">مسير الرواتب (Payroll)</h2>
          <p className="text-slate-500 mt-1">إعداد رواتب الشهر، الاستقطاعات، التأمينات، وإرسال قسائم الدفع (Payslips).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveModal('taxes_insurance')} className="bg-primary-50 text-primary-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-100 transition flex items-center gap-2">
            <Banknote className="w-4 h-4" /> دفعيات الضرائب والتأمينات
          </button>
          <button onClick={() => setActiveModal('new_run')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2">
            <PlayCircle className="w-4 h-4" /> إنشاء مسير رواتب جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">إجمالي الرواتب الأساسية</div>
           <div className="text-2xl font-black text-slate-800 font-mono" dir="ltr">{new Intl.NumberFormat('ar-EG').format(70000)} EGP</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">إجمالي الاستقطاعات والتأمينات</div>
           <div className="text-2xl font-black text-rose-600 font-mono" dir="ltr">{new Intl.NumberFormat('ar-EG').format(17700)} EGP</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">صافي الرواتب المدفوعة</div>
           <div className="text-2xl font-black text-emerald-600 font-mono" dir="ltr">{new Intl.NumberFormat('ar-EG').format(71300)} EGP</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الشهر المالي</th>
                <th className="px-6 py-4 text-start">تاريخ الإصدار</th>
                <th className="px-6 py-4 text-end">الأساسي + الإضافي</th>
                <th className="px-6 py-4 text-end">الخصومات (ضرائب/تأمينات)</th>
                <th className="px-6 py-4 text-end">الصافي (Net)</th>
                <th className="px-6 py-4 text-start">الحالة</th>
                <th className="px-6 py-4 text-end">إجراءات (Payslips)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {payrolls.map((run) => (
                <tr key={run.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-900 font-mono">{run.period}</div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    {format(new Date(run.date), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(run.total_basic + run.total_allowances + run.total_bonuses)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-rose-600" dir="ltr">
                    -{new Intl.NumberFormat('ar-EG').format(run.total_deductions + run.total_taxes + run.total_social_insurance)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-emerald-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(run.net_salary)}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', run.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                      {run.status === 'paid' ? 'تم الدفع' : 'تحت المراجعة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end flex items-center justify-end gap-1">
                     <button title="تصدير مجمع PDF" className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Download className="w-4 h-4" /></button>
                     <button onClick={() => alert('تم إرسال قسائم الرواتب عبر البريد لكل الموظفين')} title="إرسال عبر الإيميل (Auto Email)" className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Send className="w-4 h-4" /></button>
                     <button title="اعتماد كشوف الرواتب" className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition"><CheckCircle2 className="w-4 h-4" /></button>
                     <button title="التفاصيل" className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition"><FileText className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'new_run' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إنشاء مسير رواتب جديد</h3>
              <button disabled={isProcessing} onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-800 text-sm">
                 سيتم حساب الرواتب الأساسية، البدلات، المكافآت، الخصومات بناءً على بيانات الموظفين وسجلات الحضور والانصراف.
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الشهر المالي (Period)</label>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 focus:border-primary-500 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all" />
              </div>
              
              <button 
                onClick={handleCreateRun}
                disabled={isProcessing}
                className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 mt-4"
              >
                {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin"/> جاري التحضير...</> : 'بدء الحساب (Generate Payroll)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'taxes_insurance' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">دفعيات الضرائب والتأمينات</h3>
              <button disabled={isProcessing} onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {isTaxesPaid ? (
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center space-y-3">
                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                   </div>
                   <h4 className="font-bold text-lg">تم السداد بالفعل</h4>
                   <p className="text-sm opacity-90">تم سداد مستحقات الضرائب والتأمينات لهذا الشهر بالكامل، وتم إصدار قيد اليومية تلقائياً.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">عن شهر</label>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 focus:border-primary-500 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none transition-all" />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">ضريبة كسب العمل المستحقة</span>
                        <span className="font-mono font-bold text-slate-900" dir="ltr">8,000 EGP</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-3">
                        <span className="text-slate-600">التأمينات الاجتماعية المستحقة</span>
                        <span className="font-mono font-bold text-slate-900" dir="ltr">7,700 EGP</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-t border-rose-200 pt-3">
                        <span className="font-bold text-rose-700">إجمالي المطلوب سداده</span>
                        <span className="font-mono font-black text-rose-700 text-lg" dir="ltr">15,700 EGP</span>
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">صرف من حساب (Pay From)</label>
                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none">
                      {banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name} - {bank.currency}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    onClick={handlePayTaxes}
                    disabled={isProcessing}
                    className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2 mt-4"
                  >
                    {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin"/> جاري السداد...</> : 'تأكيد السداد وإصدار القيد'}
                  </button>
                </>
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
