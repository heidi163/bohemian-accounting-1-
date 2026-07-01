import { useEffect, useState } from "react";
import { type Bill } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { FileText, Send, Download, DollarSign, Settings, X, ShieldCheck } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-primary-100 text-primary-700',
  partial: 'bg-blue-100 text-blue-700',
  paid: 'bg-primary-100 text-primary-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const statusTranslations: Record<string, string> = {
  draft: 'مسودة',
  pending_approval: 'في انتظار الموافقة',
  approved: 'مُعتمدة',
  partial: 'جزئي',
  paid: 'مسددة',
  overdue: 'متأخرة',
  cancelled: 'ملغاة',
};

export function PurchasesPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedBills, setSelectedBills] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<null | 'payment' | 'approval'>(null);
  const [focusedBill, setFocusedBill] = useState<Bill | null>(null);
  
  const [toastMsg, setToastMsg] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const navigate = useNavigate();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchBills = () => {
    fetch("/api/bills")
      .then((res) => {
         if (!res.ok) throw new Error('API failed');
         return res.json();
      })
      .then((data) => {
         if (data.success) setBills(data.data);
      })
      .catch(() => {
         const localBills = JSON.parse(localStorage.getItem(getCompanyKey('mock_bills')) || '[]');
         if (localBills.length > 0) {
            setBills(localBills);
         } else {
            const defaultBills = [
              { id: 1, bill_number: 'BILL-2026-00001', reference_number: 'AWS-INV-001', supplier_name: 'Amazon Web Services', total_amount: 1200, paid_amount: 1200, tax_amount: 0, status: 'paid', bill_date: '2026-05-01', due_date: '2026-05-31', currency: 'USD', project_id: 'PRJ-001' },
              { id: 2, bill_number: 'BILL-2026-00002', reference_number: 'AD-2026', supplier_name: 'Google Ads', total_amount: 15000, paid_amount: 5000, tax_amount: 2100, status: 'partial', bill_date: '2026-06-01', due_date: '2026-06-15', currency: 'EGP', cost_center: 'HQ' },
              { id: 3, bill_number: 'BILL-2026-00003', reference_number: 'RN-1234', supplier_name: 'Digital Ocean', total_amount: 450, paid_amount: 0, tax_amount: 0, status: 'pending_approval', bill_date: '2026-06-10', due_date: '2026-06-25', currency: 'USD' }
            ];
            setBills(defaultBills as any);
            localStorage.setItem(getCompanyKey('mock_bills'), JSON.stringify(defaultBills));
         }
      });
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedBills);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBills(next);
  };

  const openModal = (type: 'payment' | 'approval', bill?: Bill) => {
    setFocusedBill(bill || null);
    setActiveModal(type);
  };

  const handlePayment = async () => {
    try {
      if (focusedBill) {
        const amount = paymentAmount ? parseFloat(paymentAmount) : (focusedBill.total_amount - focusedBill.paid_amount);
        const res = await fetch(`/api/bills/${focusedBill.id}/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        if (!res.ok) throw new Error('Network error');
        const result = await res.json();
        if (result.success) {
          showToast(result.message || 'تم إثبات السداد بنجاح');
        }
      } else if (selectedBills.size > 0) {
        for (const id of selectedBills) {
          const bill = bills.find(b => b.id === id);
          if (bill) {
            const amount = bill.total_amount - bill.paid_amount;
            await fetch(`/api/bills/${id}/payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount })
            });
          }
        }
        showToast('تم إثبات السداد المجمع بنجاح');
      }
      fetchBills();
    } catch (e) {
      let nextBills = [...bills];
      const amount = paymentAmount ? parseFloat(paymentAmount) : (focusedBill ? (focusedBill.total_amount - focusedBill.paid_amount) : 0);
      
      if (focusedBill) {
        nextBills = nextBills.map(b => {
          if (b.id === focusedBill.id) {
            const newPaid = b.paid_amount + amount;
            return { ...b, status: newPaid >= b.total_amount ? 'paid' : 'partial', paid_amount: newPaid };
          }
          return b;
        });
        showToast('تم إثبات السداد (وضع التخزين المحلي)');
      } else if (selectedBills.size > 0) {
        nextBills = nextBills.map(b => 
          selectedBills.has(b.id) ? { ...b, status: 'paid', paid_amount: b.total_amount } : b
        );
        showToast('تم إثبات السداد المجمع (وضع التخزين المحلي)');
      }
      setBills(nextBills);
      localStorage.setItem(getCompanyKey('mock_bills'), JSON.stringify(nextBills));
    }
    setActiveModal(null);
    setSelectedBills(new Set());
    setPaymentAmount('');
  };

  const handleApproval = async (status: 'approved' | 'cancelled') => {
    if (focusedBill) {
      try {
        const res = await fetch(`/api/bills/${focusedBill.id}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Network error');
        const result = await res.json();
        if (result.success) {
          showToast(result.message || 'تم الاعتماد بنجاح');
          fetchBills();
        } else {
          showToast('حدث خطأ أثناء الاعتماد');
        }
      } catch (e) {
        const nextBills = bills.map(b => b.id === focusedBill.id ? { ...b, status } : b);
        setBills(nextBills);
        localStorage.setItem(getCompanyKey('mock_bills'), JSON.stringify(nextBills));
        showToast(status === 'approved' ? 'تم اعتماد الفاتورة (وضع التخزين المحلي)' : 'تم رفض الفاتورة (وضع التخزين المحلي)');
      }
      setActiveModal(null);
    }
  };

  const handleDownload = async (bill: Bill) => {
    showToast('جاري تحميل المرفق من السيرفر...');
    try {
      const res = await fetch(`/api/bills/${bill.id}/download`);
      if (!res.ok) throw new Error('Network error');
      const result = await res.json();
      if (result.success) {
        showToast(result.message || 'تم تحميل الملف بنجاح!');
      } else {
        showToast('فشل في تحميل الملف');
      }
    } catch (e) {
      showToast('تم التحميل (وضع التخزين المحلي)');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">المشتريات والموردين (Payables)</h2>
          <p className="text-slate-500 mt-1">إدارة فواتير المشتريات، متابعة المدفوعات المستحقة، والموردين.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedBills.size > 0 && (
            <button onClick={() => openModal('payment')} className="bg-primary-100 text-primary-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-200 transition flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> سداد مجمع ({selectedBills.size})
            </button>
          )}
          <button onClick={() => navigate('/purchases/new')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
            فاتورة مشتريات جديدة
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إجمالي المشتريات</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><FileText className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-slate-900">{bills.length} فاتورة</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>مدفوعات مستحقة</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><DollarSign className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(bills.filter(b => b.status !== 'paid' && b.status !== 'cancelled').reduce((acc, curr) => acc + (curr.total_amount - curr.paid_amount), 0))}</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>قيد الاعتماد</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><ShieldCheck className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-amber-600">{bills.filter(b => b.status === 'pending_approval').length} فواتير</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>تم السداد</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><DollarSign className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-primary-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(bills.reduce((acc, curr) => acc + curr.paid_amount, 0))}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-center w-12">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedBills(new Set(bills.map(i => i.id)));
                      else setSelectedBills(new Set());
                    }} 
                    checked={selectedBills.size === bills.length && bills.length > 0}
                    className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                  />
                </th>
                <th className="px-6 py-4 text-start">الرقم / رقم مرجعي</th>
                <th className="px-6 py-4 text-start">المورد (Supplier)</th>
                <th className="px-6 py-4 text-start">التاريخ</th>
                <th className="px-6 py-4 text-end">المبلغ (VAT)</th>
                <th className="px-6 py-4 text-start">الحالة</th>
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      onChange={() => toggleSelect(bill.id)} 
                      checked={selectedBills.has(bill.id)}
                      className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                    />
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="font-semibold text-slate-900">{bill.bill_number}</div>
                    <div className="text-xs text-slate-500 mt-1 font-mono">{bill.reference_number || 'بدون مرجع'}</div>
                    {bill.project_id && <div className="text-[10px] bg-slate-100 text-slate-600 px-1 inline-block mt-1 font-mono rounded">{bill.project_id}</div>}
                  </td>
                  <td className="px-6 py-4 text-start font-medium text-slate-800">{bill.supplier_name}</td>
                  <td className="px-6 py-4 text-start">
                    <div>{format(new Date(bill.bill_date), 'yyyy/MM/dd')}</div>
                    <div className="text-xs text-slate-400 mt-0.5">استحقاق {format(new Date(bill.due_date), 'yyyy/MM/dd')}</div>
                  </td>
                  <td className="px-6 py-4 text-end font-mono text-slate-900 font-bold" dir="ltr">
                    <div>{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: bill.currency }).format(bill.total_amount)}</div>
                    {bill.tax_amount ? (
                      <div className="text-[10px] text-slate-500 font-normal mt-1 flex gap-1 justify-end">
                        <span className="text-rose-500">+{bill.tax_amount} VAT</span>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', statusStyles[bill.status])}>
                      {statusTranslations[bill.status]}
                    </span>
                    {['partial', 'approved', 'overdue'].includes(bill.status) && (
                      <div className="text-[10px] text-slate-500 mt-1.5 font-mono" dir="ltr">
                        {bill.paid_amount > 0 ? `${new Intl.NumberFormat('ar-EG', { style: 'decimal' }).format(bill.paid_amount)} paid` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-end flex items-center justify-end gap-1">
                    <button 
                      onClick={() => bill.status === 'pending_approval' ? openModal('approval', bill) : undefined} 
                      title="اعتماد الفاتورة" 
                      className={clsx("p-2 rounded-lg transition", bill.status === 'pending_approval' ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600" : "text-slate-200 cursor-not-allowed")}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDownload(bill)} 
                      title="تنزيل المرفقات" 
                      className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => ['approved', 'partial', 'overdue'].includes(bill.status) ? openModal('payment', bill) : undefined} 
                      title="تسجيل صرف" 
                      className={clsx("p-2 rounded-lg transition", ['approved', 'partial', 'overdue'].includes(bill.status) ? "text-slate-400 hover:bg-primary-50 hover:text-primary-600" : "text-slate-200 cursor-not-allowed")}
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'payment' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {focusedBill ? 'دفع فاتورة مشتريات' : 'تسجيل صرف مجمع (Bulk Payment Allocation)'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {focusedBill ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-sm font-semibold text-slate-700">فاتورة {focusedBill.bill_number}</span>
                     <span className="text-xs text-slate-500">{focusedBill.supplier_name}</span>
                  </div>
                  <div className="text-lg font-black text-rose-600 font-mono">المديونية: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: focusedBill.currency }).format(focusedBill.total_amount - focusedBill.paid_amount)}</div>
                </div>
              ) : (
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-800 text-sm">
                  سيتم سداد مستحقات الفواتير المحددة بعدد ({selectedBills.size}).
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ المدفوع (Paid Amount)</label>
                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={focusedBill ? String(focusedBill.total_amount - focusedBill.paid_amount) : "0.00"} className="w-full bg-slate-50 border border-rose-200 focus:border-rose-500 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none text-right font-bold text-lg" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">صرف من حساب (Pay From)</label>
                <select className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none">
                  <option>البنك الأهلي - EGP</option>
                  <option>CIB - USD</option>
                  <option>الخزينة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">طريقة السداد</label>
                <select className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none">
                  <option>تحويل بنكي</option>
                  <option>شيك</option>
                  <option>نقدي</option>
                </select>
              </div>
              <button 
                onClick={handlePayment}
                className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition mt-4"
              >
                تأكيد الدفع (Record Payment)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'approval' && focusedBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">مراجعة واعتماد الفاتورة</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-800 text-sm mb-4">
                 يجب اعتماد الفاتورة من الإدارة المالية قبل التمكن من إجراء مدفوعات عليها.
              </div>
              <ul className="space-y-2 text-sm text-slate-700 mb-6">
                 <li className="flex justify-between"><span>رقم الفاتورة:</span> <strong>{focusedBill.bill_number}</strong></li>
                 <li className="flex justify-between"><span>المورد:</span> <strong>{focusedBill.supplier_name}</strong></li>
                 <li className="flex justify-between"><span>الإجمالي:</span> <strong className="font-mono text-rose-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: focusedBill.currency }).format(focusedBill.total_amount)}</strong></li>
              </ul>
              
              <div className="flex gap-2">
                <button onClick={() => handleApproval('approved')} className="flex-1 bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition">اعتماد (Approve)</button>
                <button onClick={() => handleApproval('cancelled')} className="flex-1 bg-rose-50 text-rose-600 font-bold py-3 text-sm rounded-xl hover:bg-rose-100 transition border border-rose-200">رفض (Reject)</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-6 left-6 bg-primary-600 text-white px-6 py-3 rounded-xl shadow-lg font-bold text-sm z-50 flex items-center gap-2">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
