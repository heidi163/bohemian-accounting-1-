import { toast } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { type Loan, type LoanInstallment } from "../types";
import { clsx } from "clsx";
import { Landmark, Calendar, Banknote, ShieldAlert, CheckCircle, Clock, ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { getCompanyKey } from '../utils/storage';
import { SearchableSelect } from '../components/ui/SearchableSelect';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<{ loanId: number, installment: LoanInstallment } | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLoanForm, setNewLoanForm] = useState({
    type: 'bank',
    lender_name: '',
    principal: 100000,
    interest_rate: 15,
    months: 12,
    start_date: new Date().toISOString().split('T')[0]
  });

  const fetchLoans = () => {
    fetch("/api/loans")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setLoans(data.data))
      .catch(() => {
        const localLoans = JSON.parse(localStorage.getItem(getCompanyKey('mock_loans_v2')) || '[]');
        if (localLoans.length > 0) {
          setLoans(localLoans);
        } else {
          const defaults = [
            {
              id: 1,
              lender_name: "البنك الأهلي المصري",
              type: "bank",
              total_amount: 500000,
              remaining_principal: 300000,
              interest_rate: 15,
              start_date: "2024-01-01",
              end_date: "2029-01-01",
              installments: [
                { id: 1, due_date: "2026-05-01", principal_amount: 8333, interest_amount: 3750, total_amount: 12083, status: "paid" },
                { id: 2, due_date: "2026-06-01", principal_amount: 8333, interest_amount: 3750, total_amount: 12083, status: "pending" }
              ]
            }
          ];
          localStorage.setItem(getCompanyKey('mock_loans_v2'), JSON.stringify(defaults));
          setLoans(defaults);
        }
      });
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handlePayInstallment = async () => {
    if (!activeModal) return;
    setTimeout(() => {
      const localLoans = JSON.parse(localStorage.getItem(getCompanyKey('mock_loans_v2')) || '[]');
      const updatedLoans = localLoans.map((loan: any) => {
        if (loan.id === activeModal.loanId) {
          const updatedInstallments = loan.installments.map((inst: any) => {
            if (inst.id === activeModal.installment.id) {
              return { ...inst, status: 'paid' };
            }
            return inst;
          });
          return {
            ...loan,
            remaining_principal: loan.remaining_principal - activeModal.installment.principal_amount,
            installments: updatedInstallments
          };
        }
        return loan;
      });
      localStorage.setItem(getCompanyKey('mock_loans_v2'), JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
      setActiveModal(null);
      toast.success('تم سداد القسط بنجاح');
    }, 500);
  };

  const handleAddLoanSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const principal = newLoanForm.principal;
      const rate = newLoanForm.interest_rate / 100 / 12; // Monthly rate
      const months = newLoanForm.months;
      
      let monthlyPayment = 0;
      let interestTotal = 0;
      
      if (rate > 0) {
        monthlyPayment = principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
        interestTotal = (monthlyPayment * months) - principal;
      } else {
        monthlyPayment = principal / months;
      }
      
      const installments = Array.from({ length: months }).map((_, idx) => {
        const dueDate = new Date(newLoanForm.start_date);
        dueDate.setMonth(dueDate.getMonth() + idx + 1);
        
        // Simple amortization breakdown
        const interestAmount = (principal - (monthlyPayment - (interestTotal/months)) * idx) * rate;
        const principalAmount = monthlyPayment - interestAmount;

        return {
          id: Date.now() + idx,
          due_date: dueDate.toISOString().split('T')[0],
          principal_amount: principalAmount,
          interest_amount: interestAmount,
          total_amount: monthlyPayment,
          status: 'pending' as const
        };
      });

      const end_date = installments[installments.length - 1].due_date;

      const newLoan: Loan = {
        id: Date.now(),
        type: newLoanForm.type as 'bank' | 'personal',
        lender_name: newLoanForm.lender_name,
        total_amount: principal + interestTotal,
        remaining_principal: principal,
        interest_rate: newLoanForm.interest_rate,
        start_date: newLoanForm.start_date,
        end_date,
        installments
      };

      const localLoans = JSON.parse(localStorage.getItem(getCompanyKey('mock_loans_v2')) || '[]');
      const updatedLoans = [newLoan, ...localLoans];
      
      localStorage.setItem(getCompanyKey('mock_loans_v2'), JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
      
      setIsSubmitting(false);
      setIsAddModalOpen(false);
      toast.success('تمت إضافة القرض بنجاح');
      
      // Reset form
      setNewLoanForm({
        type: 'bank',
        lender_name: '',
        principal: 100000,
        interest_rate: 15,
        months: 12,
        start_date: new Date().toISOString().split('T')[0]
      });
    }, 600);
  };

  const totalRemainingPrincipal = loans.reduce((sum, loan) => sum + loan.remaining_principal, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Landmark className="w-6 h-6" />
            </div>
            إدارة القروض (Loans Management)
          </h1>
          <p className="text-slate-500 mt-1 text-sm">تتبع القروض البنكية والشخصية، الفوائد، وجداول السداد.</p>
        </div>
        <button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md">
           <Plus className="w-5 h-5" />
           إضافة قرض جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                <Landmark className="w-5 h-5" />
             </div>
             <div className="font-bold text-slate-800">إجمالي الرصيد المتبقي (أصل القرض)</div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(totalRemainingPrincipal)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loans.map(loan => (
          <div key={loan.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div 
              className="p-6 flex flex-wrap gap-4 items-center justify-between cursor-pointer hover:bg-slate-50 transition"
              onClick={() => setExpandedLoan(expandedLoan === loan.id ? null : loan.id)}
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    {loan.type === 'bank' ? <Landmark className="w-6 h-6"/> : <ShieldAlert className="w-6 h-6"/>}
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-900">{loan.lender_name} <span className="text-sm font-normal text-slate-500">({loan.type === 'bank' ? 'قرض بنكي' : loan.type === 'personal' ? 'قرض شخصي' : loan.type})</span></h3>
                    <div className="text-sm text-slate-500 mt-1 flex gap-4 font-mono">
                      <span>الفائدة: {loan.interest_rate}%</span>
                      <span>تاريخ الانتهاء: {loan.end_date}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-end">
                    <div className="text-xs text-slate-500 font-bold mb-1">الرصيد المتبقي (Remaining Principal)</div>
                    <div className="font-mono font-bold text-lg text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG').format(loan.remaining_principal)}</div>
                 </div>
                 <div className="text-slate-400">
                    {expandedLoan === loan.id ? <ChevronUp /> : <ChevronDown />}
                 </div>
              </div>
            </div>

            {expandedLoan === loan.id && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                <h4 className="font-bold text-slate-800 mb-4">جدول الأقساط (Installment Schedule)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
                     <thead className="bg-slate-100 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                           <th className="px-4 py-3 text-start">تاريخ الاستحقاق</th>
                           <th className="px-4 py-3 text-end">أصل المبلغ (Principal)</th>
                           <th className="px-4 py-3 text-end">الفائدة (Interest)</th>
                           <th className="px-4 py-3 text-end">الإجمالي (Total)</th>
                           <th className="px-4 py-3 text-center">الحالة</th>
                           <th className="px-4 py-3 text-end">الإجراءات</th>
                        </tr>
                     </thead>
                     <tbody className="text-sm">
                        {loan.installments.map(inst => (
                           <tr key={inst.id} className="border-t border-slate-100">
                              <td className="px-4 py-3 font-mono text-slate-600">{inst.due_date}</td>
                              <td className="px-4 py-3 text-end font-mono">{new Intl.NumberFormat('ar-EG').format(inst.principal_amount)}</td>
                              <td className="px-4 py-3 text-end font-mono text-rose-500">{new Intl.NumberFormat('ar-EG').format(inst.interest_amount)}</td>
                              <td className="px-4 py-3 text-end font-mono font-bold text-slate-900">{new Intl.NumberFormat('ar-EG').format(inst.total_amount)}</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={clsx('inline-flex items-center rounded-md px-2 py-1 text-xs font-bold', inst.status === 'paid' ? 'bg-primary-100 text-primary-700' : 'bg-amber-100 text-amber-700')}>
                                    {inst.status === 'paid' ? 'مسدد' : 'مستحق'}
                                 </span>
                              </td>
                              <td className="px-4 py-3 text-end">
                                 {inst.status === 'pending' && (
                                    <button onClick={() => setActiveModal({ loanId: loan.id, installment: inst })} className="text-primary-600 font-semibold hover:underline bg-primary-50 px-3 py-1.5 rounded-lg text-xs">
                                       سداد (Post Payment)
                                    </button>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">سداد القسط (Post Payment)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                     <div className="text-sm text-slate-500">تاريخ الاستحقاق</div>
                     <div className="font-bold text-slate-800 font-mono">{activeModal.installment.due_date}</div>
                  </div>
                  <div className="text-end">
                     <div className="text-sm text-slate-500">الإجمالي المستحق</div>
                     <div className="font-bold text-primary-600 text-lg font-mono" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(activeModal.installment.total_amount)}</div>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 p-4 rounded-xl text-center">
                     <div className="text-xs text-slate-500 font-bold mb-1">أصل المبلغ (يخفض الرصيد)</div>
                     <div className="font-mono font-bold text-slate-900">{new Intl.NumberFormat('ar-EG').format(activeModal.installment.principal_amount)}</div>
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl text-center">
                     <div className="text-xs text-slate-500 font-bold mb-1">الفائدة (تُحمل كمصروف)</div>
                     <div className="font-mono font-bold text-rose-600">{new Intl.NumberFormat('ar-EG').format(activeModal.installment.interest_amount)}</div>
                  </div>
               </div>
              <div className="pt-2">
                 <button 
                   onClick={handlePayInstallment}
                   className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition"
                 >
                   تأكيد السداد وتحديث الرصيد
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إضافة قرض جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">نوع القرض</label>
                 <SearchableSelect 
                   value={newLoanForm.type} 
                   onChange={(value) => setNewLoanForm({...newLoanForm, type: value})} 
                   options={[
                     { value: 'bank', label: 'قرض بنكي' },
                     { value: 'personal', label: 'قرض شخصي' }
                   ]}
                   allowCreate={true}
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">المُقرض (اسم البنك/الشخص)</label>
                 <SearchableSelect 
                   value={newLoanForm.lender_name} 
                   onChange={(value) => setNewLoanForm({...newLoanForm, lender_name: value})} 
                   options={[
                     { value: 'البنك الأهلي المصري', label: 'البنك الأهلي المصري' },
                     { value: 'بنك مصر', label: 'بنك مصر' },
                     { value: 'CIB', label: 'CIB' }
                   ]}
                   allowCreate={true}
                   placeholder="اختر أو اكتب اسم المُقرض..."
                 />
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">قيمة القرض (Principal)</label>
                   <input 
                     type="number" 
                     value={newLoanForm.principal || ''} 
                     onChange={(e) => setNewLoanForm({...newLoanForm, principal: Number(e.target.value)})} 
                     className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-mono font-bold rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">الفائدة السنوية (%)</label>
                   <input 
                     type="number" 
                     value={newLoanForm.interest_rate || ''} 
                     onChange={(e) => setNewLoanForm({...newLoanForm, interest_rate: Number(e.target.value)})} 
                     className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-mono rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right" 
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">عدد الأشهر (Months)</label>
                   <input 
                     type="number" 
                     value={newLoanForm.months || ''} 
                     onChange={(e) => setNewLoanForm({...newLoanForm, months: Number(e.target.value)})} 
                     className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-mono rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right" 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ البدء</label>
                   <input 
                     type="date" 
                     value={newLoanForm.start_date} 
                     onChange={(e) => setNewLoanForm({...newLoanForm, start_date: e.target.value})} 
                     className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-mono rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                   />
                 </div>
               </div>

               <div className="pt-4">
                 <button 
                   onClick={handleAddLoanSubmit}
                   disabled={isSubmitting || !newLoanForm.lender_name}
                   className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
                 >
                   {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإضافة'}
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
