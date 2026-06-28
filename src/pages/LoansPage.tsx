import { useEffect, useState } from "react";
import { type Loan, type LoanInstallment } from "../types";
import { clsx } from "clsx";
import { Landmark, Calendar, Banknote, ShieldAlert, CheckCircle, Clock, ChevronDown, ChevronUp, X } from "lucide-react";

export function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [expandedLoan, setExpandedLoan] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<{ loanId: number, installment: LoanInstallment } | null>(null);

  const fetchLoans = () => {
    fetch("/api/loans")
      .then((res) => res.json())
      .then((data) => setLoans(data.data));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handlePayInstallment = async () => {
    if (!activeModal) return;
    try {
      const res = await fetch("/api/loans/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loan_id: activeModal.loanId, installment_id: activeModal.installment.id })
      });
      const data = await res.json();
      if (data.success) {
        alert('تم سداد القسط بنجاح');
        setActiveModal(null);
        setLoans(data.data);
      }
    } catch (error) {
      console.error("Payment failed", error);
    }
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
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
