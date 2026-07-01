import { toast } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { type PayrollRun } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { PlayCircle, Download, Send, CheckCircle2, FileText, Banknote, X, RefreshCw, Calculator, Receipt } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

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
    const activeCompany = getActiveCompany();
    const defaults: PayrollRun[] = [
      { id: 1, period: "2026-05", date: "2026-05-28", total_basic: 70000, total_allowances: 15000, total_bonuses: 4000, total_deductions: 2000, total_taxes: 8000, total_social_insurance: 7700, net_salary: 71300, status: "paid", company_id: 'O2N' },
      { id: 2, period: "2026-06", date: "2026-06-29", total_basic: 72000, total_allowances: 15500, total_bonuses: 0, total_deductions: 500, total_taxes: 8200, total_social_insurance: 7900, net_salary: 70900, status: "under_review", company_id: 'O2N' },
      { id: 3, period: "2026-05", date: "2026-05-28", total_basic: 45000, total_allowances: 5000, total_bonuses: 0, total_deductions: 0, total_taxes: 4000, total_social_insurance: 3000, net_salary: 43000, status: "paid", company_id: 'BGK' }
    ];

    const localPayrolls = JSON.parse(localStorage.getItem(getCompanyKey('mock_payrolls')) || '[]');
    
    if (localPayrolls.length > 0) {
      setPayrolls(localPayrolls.filter((p: any) => p.company_id === activeCompany || !p.company_id));
    } else {
      localStorage.setItem(getCompanyKey('mock_payrolls'), JSON.stringify(defaults));
      setPayrolls(defaults.filter((p: any) => p.company_id === activeCompany));
    }
  };

  useEffect(() => {
    fetchPayrolls();
    const activeCompany = getActiveCompany();
    const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
    
    // Filter banks by company
    const filteredBanks = localBanks.filter((b: any) => b.company_id === activeCompany || !b.company_id);
    
    if (filteredBanks.length > 0) {
      setBanks(filteredBanks);
      setSelectedBankId(filteredBanks[0].id.toString());
    } else {
      fetch("/api/banks").then(res => res.json()).then(data => {
        const defaultBanks = data.data || [];
        setBanks(defaultBanks);
        if (defaultBanks.length > 0) setSelectedBankId(defaultBanks[0].id.toString());
      }).catch(console.error);
    }
  }, []);

  const handleCreateRun = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const activeCompany = getActiveCompany();
      const localPayrolls = JSON.parse(localStorage.getItem(getCompanyKey('mock_payrolls')) || '[]');
      const newRun: PayrollRun = {
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
        status: 'under_review',
        company_id: activeCompany
      };
      
      const updated = [newRun, ...localPayrolls];
      localStorage.setItem(getCompanyKey('mock_payrolls'), JSON.stringify(updated));
      
      setPayrolls([newRun, ...payrolls]);
      setActiveModal(null);
      showToast('تم إعداد مسير الرواتب بنجاح');
      setIsProcessing(false);
    }, 1000);
  };

  const handlePayTaxes = async () => {
    setIsProcessing(true);
    setTimeout(() => {
      const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
      const bank = localBanks.find((b: any) => b.id.toString() === selectedBankId);
      if (bank) {
        bank.balance -= 15700;
        localStorage.setItem(getCompanyKey('mock_banks'), JSON.stringify(localBanks));
      }
      setActiveModal(null);
      setIsTaxesPaid(true);
      showToast('تم سداد ضرائب وتأمينات الرواتب بنجاح وإصدار القيد');
      setIsProcessing(false);
    }, 1000);
  };

  // Calculate KPIs
  const currentMonthRun = payrolls.length > 0 ? payrolls[0] : null;
  const kpiBasic = currentMonthRun ? currentMonthRun.total_basic + currentMonthRun.total_allowances + currentMonthRun.total_bonuses : 0;
  const kpiDeductions = currentMonthRun ? currentMonthRun.total_deductions + currentMonthRun.total_taxes + currentMonthRun.total_social_insurance : 0;
  const kpiNet = currentMonthRun ? currentMonthRun.net_salary : 0;

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-3">
            <div className="p-3 bg-primary-100 text-primary-700 rounded-2xl">
               <Receipt className="w-6 h-6" />
            </div>
            مسير الرواتب (Payroll)
          </h2>
          <p className="text-slate-500 mt-2 font-medium">إعداد رواتب الشهر، الاستقطاعات، التأمينات، وإرسال قسائم الدفع (Payslips).</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <button onClick={() => setActiveModal('taxes_insurance')} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2">
            <Banknote className="w-5 h-5" /> دفعيات الضرائب والتأمينات
          </button>
          <button onClick={() => setActiveModal('new_run')} className="bg-primary-600 shadow-lg shadow-primary-600/20 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <PlayCircle className="w-5 h-5" /> إنشاء مسير رواتب جديد
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي الرواتب الأساسية</p>
              <h3 className="font-black text-slate-800 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(kpiBasic)} EGP</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي الاستقطاعات والتأمينات</p>
              <h3 className="font-black text-rose-600 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(kpiDeductions)} EGP</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">صافي الرواتب المدفوعة</p>
              <h3 className="font-black text-primary-600 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(kpiNet)} EGP</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">سجل الرواتب</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-black tracking-wider">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الشهر المالي</th>
                <th className="px-6 py-4 text-start">تاريخ الإصدار</th>
                <th className="px-6 py-4 text-end">الأساسي + الإضافي</th>
                <th className="px-6 py-4 text-end">الخصومات (ضرائب/تأمينات)</th>
                <th className="px-6 py-4 text-end">الصافي (Net)</th>
                <th className="px-6 py-4 text-start">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات (Payslips)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {payrolls.length > 0 ? payrolls.map((run) => (
                <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-900 text-base font-mono">{run.period}</div>
                  </td>
                  <td className="px-6 py-4 text-start text-slate-600 font-mono text-sm">
                    {format(new Date(run.date), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-slate-800" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(run.total_basic + run.total_allowances + run.total_bonuses)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-rose-600" dir="ltr">
                    -{new Intl.NumberFormat('ar-EG').format(run.total_deductions + run.total_taxes + run.total_social_insurance)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-black text-primary-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(run.net_salary)}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={clsx(
                      'inline-flex items-center rounded-xl px-3 py-1 text-xs font-black', 
                      run.status === 'paid' ? 'bg-primary-50 text-primary-600' : 'bg-amber-50 text-amber-600'
                    )}>
                      {run.status === 'paid' ? 'تم الدفع' : 'تحت المراجعة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-2">
                        <button title="تصدير مجمع PDF" className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                           <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => toast.success('تم إرسال قسائم الرواتب عبر البريد لكل الموظفين')} title="إرسال عبر الإيميل (Auto Email)" className="p-2.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                           <Send className="w-4 h-4" />
                        </button>
                        {run.status !== 'paid' && (
                          <button title="اعتماد كشوف الرواتب" className="p-2.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors">
                             <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button title="التفاصيل" className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors">
                           <FileText className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">لا يوجد سجلات رواتب.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'new_run' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">إنشاء مسير رواتب جديد</h3>
              <button disabled={isProcessing} onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-800 text-sm font-medium">
                 سيتم حساب الرواتب الأساسية، البدلات، المكافآت، الخصومات بناءً على بيانات الموظفين وسجلات الحضور والانصراف المعتمدة.
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الشهر المالي (Period)</label>
                <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 focus:border-primary-500 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none transition-all shadow-sm" />
              </div>
              
              <button 
                onClick={handleCreateRun}
                disabled={isProcessing}
                className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 mt-4"
              >
                {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin"/> جاري التحضير...</> : 'بدء الحساب (Generate Payroll)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'taxes_insurance' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">دفعيات الضرائب والتأمينات</h3>
              <button disabled={isProcessing} onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {isTaxesPaid ? (
                <div className="bg-primary-50 text-primary-700 p-6 rounded-2xl border border-primary-100 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in">
                   <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                     <CheckCircle2 className="w-8 h-8 text-primary-600" />
                   </div>
                   <h4 className="font-bold text-lg">تم السداد بالفعل</h4>
                   <p className="text-sm opacity-90 font-medium">تم سداد مستحقات الضرائب والتأمينات لهذا الشهر بالكامل، وتم إصدار قيد اليومية تلقائياً.</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">عن شهر</label>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 focus:border-primary-500 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none transition-all shadow-sm" />
                  </div>

                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">ضريبة كسب العمل المستحقة</span>
                        <span className="font-mono font-bold text-slate-900" dir="ltr">8,000 EGP</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-t border-slate-200/60 pt-3">
                        <span className="text-slate-600 font-medium">التأمينات الاجتماعية المستحقة</span>
                        <span className="font-mono font-bold text-slate-900" dir="ltr">7,700 EGP</span>
                     </div>
                     <div className="flex justify-between items-center text-sm border-t border-rose-200 pt-3">
                        <span className="font-bold text-rose-700">إجمالي المطلوب سداده</span>
                        <span className="font-mono font-black text-rose-700 text-lg" dir="ltr">15,700 EGP</span>
                     </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">صرف من حساب (Pay From)</label>
                    <select value={selectedBankId} onChange={(e) => setSelectedBankId(e.target.value)} disabled={isProcessing} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none shadow-sm focus:border-primary-500 transition-all">
                      {banks.length > 0 ? banks.map(bank => (
                        <option key={bank.id} value={bank.id}>{bank.name} - {bank.currency}</option>
                      )) : (
                        <option value="">لا يوجد حسابات بنكية</option>
                      )}
                    </select>
                  </div>
                  
                  <button 
                    onClick={handlePayTaxes}
                    disabled={isProcessing || banks.length === 0}
                    className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin"/> جاري السداد...</> : 'تأكيد السداد وإصدار القيد'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
