import { useEffect, useState } from "react";
import { type Loan, type LoanInstallment } from "../types";
import { clsx } from "clsx";
import { Landmark, Calendar, Banknote, ShieldAlert, CheckCircle, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<{ loanId: number, installment: LoanInstallment } | null>(null);

  const fetchLoans = () => {
    fetch("/api/loans")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setLoans(data.data))
      .catch(() => {
        const localLoans = JSON.parse(localStorage.getItem(getCompanyKey('mock_loans')) || '[]');
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
          localStorage.setItem(getCompanyKey('mock_loans'), JSON.stringify(defaults));
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
      const localLoans = JSON.parse(localStorage.getItem(getCompanyKey('mock_loans')) || '[]');
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
      localStorage.setItem(getCompanyKey('mock_loans'), JSON.stringify(updatedLoans));
      setLoans(updatedLoans);
      setActiveModal(null);
      alert('تم سداد القسط بنجاح');
    }, 500);
  };

  const totalRemainingPrincipal = loans.reduce((sum, loan) => sum + loan.remaining_principal, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">إدارة القروض (Loans Management)</h2>
          <p className="text-slate-500 mt-1">تتبع القروض البنكية والشخصية، الفوائد، وجداول السداد.</p>
        </div>
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
                    <h3 className="font-bold text-lg text-slate-900">{loan.lender_name} <span className="text-sm font-normal text-slate-500">({loan.type === 'bank' ? 'قرض بنكي' : 'قرض شخصي'})</span></h3>
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
                              <td className="px-4 py-3 text-end font-mono" dir="ltr">{new Intl.NumberFormat('ar-EG').format(inst.principal_amount)}</td>
                              <td className="px-4 py-3 text-end font-mono text-rose-500" dir="ltr">{new Intl.NumberFormat('ar-EG').format(inst.interest_amount)}</td>
                              <td className="px-4 py-3 text-end font-mono font-bold text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG').format(inst.total_amount)}</td>
                              <td className="px-4 py-3 text-center">
                                 <span className={clsx('inline-flex items-center rounded-md px-2 py-1 text-xs font-bold', inst.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
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

    </div>
  );
}
