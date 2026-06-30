import { toast } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { type TaxRecord, type TaxSummary } from "../types";
import { clsx } from "clsx";
import { Calculator, FileText, CheckCircle, Clock, AlertCircle, Plus, RefreshCcw, Landmark, Receipt, X } from "lucide-react";
import apiClient from "../api/client";

const taxTypeTranslations: Record<string, string> = {
  vat: 'ضريبة القيمة المضافة',
  income: 'ضريبة الدخل',
  withholding: 'خصم من المنبع',
  payroll: 'ضريبة المرتبات',
};

export function TaxesPage() {
  const [summary, setSummary] = useState<TaxSummary | null>(null);
  const [records, setRecords] = useState<TaxRecord[]>([]);
  const [activeModal, setActiveModal] = useState<null | 'payment'>(null);
  const [focusedRecord, setFocusedRecord] = useState<TaxRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const fetchTaxes = async () => {
    try {
      const res = await apiClient.get('/taxes');
      setSummary(res.data.summary);
      setRecords(res.data.records);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل بيانات الضرائب');
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const openPayment = (record: TaxRecord) => {
    setFocusedRecord(record);
    setPaymentAmount(record.liability_amount - record.paid_amount);
    setActiveModal('payment');
  };

  const handleRegisterPayment = async () => {
    if (!focusedRecord) return;
    try {
      await apiClient.post(`/taxes/${focusedRecord.id}/pay`, {
        amount: paymentAmount,
        bank_account_id: 1 // Default to bank 1 for now
      });
      toast.success('تم تسجيل الدفعة بنجاح');
      setActiveModal(null);
      fetchTaxes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدفعة');
    }
  };

  const handlePostTax = async (record: TaxRecord) => {
    try {
      await apiClient.post(`/taxes/${record.id}/post`);
      toast.success('تم ترحيل الضريبة وإغلاق الفترة بنجاح');
      fetchTaxes();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء الترحيل');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">الضرائب (Taxes)</h2>
          <p className="text-slate-500 mt-1">إدارة الالتزامات الضريبية والمدفوعات والإقرارات.</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
             { title: 'القيمة المضافة (VAT)', liability: summary.vat_liability, paid: summary.vat_paid, icon: Receipt, color: 'primary' },
             { title: 'ضريبة الدخل (Income)', liability: summary.income_liability, paid: summary.income_paid, icon: Landmark, color: 'emerald' },
             { title: 'خصم من المنبع', liability: summary.withholding_liability, paid: summary.withholding_paid, icon: FileText, color: 'amber' },
             { title: 'ضريبة المرتبات', liability: summary.payroll_liability, paid: summary.payroll_paid, icon: Calculator, color: 'rose' },
          ].map((tax, index) => {
             const Icon = tax.icon;
             const remaining = tax.liability - tax.paid;
             return (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-${tax.color}-100 flex items-center justify-center text-${tax.color}-600`}>
                     <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-slate-800">{tax.title}</div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">الالتزام:</span>
                      <span className="font-mono font-bold text-slate-900">{new Intl.NumberFormat('ar-EG').format(tax.liability)}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500">المدفوع:</span>
                      <span className="font-mono font-bold text-emerald-600">{new Intl.NumberFormat('ar-EG').format(tax.paid)}</span>
                   </div>
                   <div className="pt-2 border-t border-slate-100 flex justify-between text-sm">
                      <span className="text-slate-700 font-bold">المتبقي:</span>
                      <span className="font-mono font-black text-rose-600">{new Intl.NumberFormat('ar-EG').format(remaining)}</span>
                   </div>
                </div>
              </div>
             )
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">نوع الضريبة</th>
                <th className="px-6 py-4 text-start">الفترة (Period)</th>
                <th className="px-6 py-4 text-end">الالتزام (Liability)</th>
                <th className="px-6 py-4 text-end">المدفوع (Paid)</th>
                <th className="px-6 py-4 text-center">تاريخ الاستحقاق</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="font-bold text-slate-600">لا توجد سجلات ضريبية</p>
                      <p className="text-sm">لم يتم إضافة أي بيانات للفترات الضريبية حتى الآن.</p>
                    </div>
                  </td>
                </tr>
              ) : records.map((record) => (
                <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-start font-bold text-slate-900">
                    {taxTypeTranslations[record.type]}
                  </td>
                  <td className="px-6 py-4 text-start font-mono text-slate-600">
                    {record.period}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(record.liability_amount)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-emerald-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(record.paid_amount)}
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    {record.due_date}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', 
                        record.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                        record.status === 'posted' ? 'bg-primary-100 text-primary-700' :
                        record.status === 'partial' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700')}>
                      {record.status === 'paid' ? 'مسدد' : record.status === 'posted' ? 'مُرحل' : record.status === 'partial' ? 'جزئي' : 'معلق'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end space-x-2 space-x-reverse">
                     {(record.status === 'pending' || record.status === 'partial') && (
                        <button onClick={() => openPayment(record)} className="text-primary-600 font-semibold text-xs hover:underline bg-primary-50 px-2 py-1.5 rounded-lg">
                           تسجيل دفعة
                        </button>
                     )}
                     {record.status === 'paid' && (
                        <button onClick={() => handlePostTax(record)} className="text-slate-600 font-semibold text-xs hover:underline bg-slate-100 px-2 py-1.5 rounded-lg">
                           ترحيل وإغلاق
                        </button>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'payment' && focusedRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">تسجيل دفعة ضريبية</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">{taxTypeTranslations[focusedRecord.type]} - {focusedRecord.period}</div>
                  <div className="text-sm text-slate-500 mb-2">إجمالي المستحق: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(focusedRecord.liability_amount - focusedRecord.paid_amount)}</div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">قيمة الدفعة (Payment Amount)</label>
                 <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-lg rounded-xl px-4 py-3 outline-none focus:border-primary-500 text-right" dir="ltr" />
               </div>

              <div className="pt-2">
                 <button 
                   onClick={handleRegisterPayment}
                   className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition"
                 >
                   تأكيد الدفع (Confirm Payment)
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
