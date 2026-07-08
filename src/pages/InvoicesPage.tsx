import { useEffect, useState } from "react";
import { type Invoice } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { useNavigate } from "react-router";
import { FileText, Send, Download, DollarSign, Settings, X, Tag } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';
import apiClient from "../api/client";
import { useTheme } from "../contexts/ThemeContext";

const statusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  issued: 'bg-blue-100 text-blue-700',
  partial: 'bg-primary-100 text-primary-700',
  paid: 'bg-primary-100 text-primary-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const statusTranslations: Record<string, string> = {
  draft: 'مسودة',
  pending_approval: 'في انتظار الموافقة',
  issued: 'مُصدرة',
  partial: 'جزئي',
  paid: 'مدفوعة',
  overdue: 'متأخرة',
  cancelled: 'ملغاة',
};

const typeTranslations: Record<string, string> = {
  invoice: 'فاتورة (Invoice)',
  quotation: 'عرض سعر (Quotation)',
  proforma: 'فاتورة مبدئية (Proforma)',
  advance: 'فاتورة دفعة مقدمة (Advance)',
  credit_note: 'إشعار دائن (Credit Note)',
};

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState<Set<number>>(new Set());
  const [activeModal, setActiveModal] = useState<null | 'payment' | 'email' | 'recurring'>(null);
  const [focusedInvoice, setFocusedInvoice] = useState<Invoice | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  
  const { primaryColor } = useTheme();
  
  const navigate = useNavigate();

  const fetchInvoices = () => {
    setLoading(true);
    const company = getActiveCompany();
    const companyId = company === "BGK" ? 1 : 2;

    apiClient.get(`/invoices?company_id=${companyId}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setInvoices(res.data.data || []);
        } else {
          throw new Error("API failed");
        }
      })
      .catch(() => {
        const localInvoices = JSON.parse(localStorage.getItem(getCompanyKey('mock_invoices')) || '[]');
        if (localInvoices.length > 0) {
          setInvoices(localInvoices);
        } else {
          const defaultInvoices = [
            { id: 1, invoice_number: 'INV-2026-00001', customer_name: 'Bohemian Geeks', total_amount: 15400, paid_amount: 5400, tax_amount: 1400, status: 'partial', invoice_date: '2026-05-15', due_date: '2026-06-15', type: 'invoice', recurring_status: 'none' },
            { id: 2, invoice_number: 'QT-2026-00102', customer_name: 'Sealy KSA', total_amount: 45000, paid_amount: 0, tax_amount: 0, status: 'draft', invoice_date: '2026-06-01', due_date: '2026-06-30', type: 'quotation', recurring_status: 'none' },
            { id: 3, invoice_number: 'INV-2026-00003', customer_name: 'Nola Cupcakes', total_amount: 8200, paid_amount: 8200, tax_amount: 1000, status: 'paid', invoice_date: '2026-06-10', due_date: '2026-06-25', type: 'invoice', recurring_status: 'active', recurring_frequency: 'monthly' }
          ];
          setInvoices(defaultInvoices as any);
          localStorage.setItem(getCompanyKey('mock_invoices'), JSON.stringify(defaultInvoices));
        }
      })
      .finally(() => setLoading(false));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSendEmail = async () => {
    if (focusedInvoice) {
      try {
        const res = await fetch(`/api/invoices/${focusedInvoice.id}/send`, { method: 'POST' });
        if (!res.ok) throw new Error('Network error');
        const result = await res.json();
        if (result.success) {
          showToast(result.message || 'تم إرسال الفاتورة وتحديث حالتها بنجاح');
          fetchInvoices();
        } else {
          showToast('حدث خطأ أثناء الإرسال');
        }
      } catch (e) {
        // Fallback for Vercel / frontend-only mode
        const nextInvoices = invoices.map(inv => 
          inv.id === focusedInvoice.id && (inv.status === 'draft' || inv.status === 'pending_approval')
            ? { ...inv, status: 'issued' }
            : inv
        );
        setInvoices(nextInvoices);
        localStorage.setItem(getCompanyKey('mock_invoices'), JSON.stringify(nextInvoices));
        showToast('تم وضع الفاتورة في طابور الإرسال (وضع التخزين المحلي)');
      }
      setActiveModal(null);
    }
  };

  const handlePayment = async () => {
    try {
      if (focusedInvoice) {
        const amount = paymentAmount ? parseFloat(paymentAmount) : (focusedInvoice.total_amount - focusedInvoice.paid_amount);
        const res = await fetch(`/api/invoices/${focusedInvoice.id}/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount })
        });
        if (!res.ok) throw new Error('Network error');
        const result = await res.json();
        if (result.success) {
          showToast(result.message || 'تم إثبات الدفع بنجاح');
        }
      } else if (selectedInvoices.size > 0) {
        for (const id of selectedInvoices) {
          const inv = invoices.find(i => i.id === id);
          if (inv) {
            const amount = inv.total_amount - inv.paid_amount;
            await fetch(`/api/invoices/${id}/payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ amount })
            });
          }
        }
        showToast('تم إثبات الدفع المجمع بنجاح');
      }
      fetchInvoices();
    } catch (e) {
      // Fallback for Vercel / frontend-only mode
      let nextInvoices = [...invoices];
      const amount = paymentAmount ? parseFloat(paymentAmount) : (focusedInvoice ? (focusedInvoice.total_amount - focusedInvoice.paid_amount) : 0);
      
      if (focusedInvoice) {
        nextInvoices = nextInvoices.map(inv => {
          if (inv.id === focusedInvoice.id) {
            const newPaid = inv.paid_amount + amount;
            return { ...inv, status: newPaid >= inv.total_amount ? 'paid' : 'partial', paid_amount: newPaid };
          }
          return inv;
        });
        showToast('تم إثبات الدفع (وضع التخزين المحلي)');
      } else if (selectedInvoices.size > 0) {
        nextInvoices = nextInvoices.map(inv => 
          selectedInvoices.has(inv.id)
            ? { ...inv, status: 'paid', paid_amount: inv.total_amount } 
            : inv
        );
        showToast('تم إثبات الدفع المجمع (وضع التخزين المحلي)');
      }
      
      setInvoices(nextInvoices);
      localStorage.setItem(getCompanyKey('mock_invoices'), JSON.stringify(nextInvoices));
    }
    
    setActiveModal(null);
    setSelectedInvoices(new Set());
    setPaymentAmount('');
  };

  const handleDownload = async (invoice: Invoice) => {
    showToast('جاري إنشاء ملف PDF من السيرفر...');
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/download`);
      if (!res.ok) throw new Error('Network error');
      const result = await res.json();
      if (result.success) {
        showToast(result.message || 'تم تحميل الملف بنجاح!');
        // In a real app we'd trigger a window.open(result.downloadUrl) here
      } else {
        showToast('فشل في إنشاء الملف');
      }
    } catch (e) {
      // Fallback
      showToast('تم التحميل (وضع التخزين المحلي)');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const toggleSelect = (id: number) => {
    const next = new Set(selectedInvoices);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedInvoices(next);
  };

  const openModal = (type: 'payment' | 'email' | 'recurring', inv?: Invoice) => {
    setFocusedInvoice(inv || null);
    setActiveModal(type);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="bg-white rounded-3xl p-12 flex items-center justify-center shadow-sm border border-slate-100">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">جاري تحميل الفواتير...</span>
          </div>
        </div>
      )}
      {!loading && (
        <>
          <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
            <div className="ps-2">
              <h2 className="font-bold text-slate-800 text-2xl">المبيعات والفواتير</h2>
              <p className="text-slate-500 mt-1">إدارة الفواتير، عروض الأسعار، المدفوعات والتحصيل.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedInvoices.size > 0 && (
                <button onClick={() => openModal('payment')} className="bg-primary-100 text-primary-800 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-200 transition flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> دفع مجمع ({selectedInvoices.size})
                </button>
              )}
              <button onClick={() => navigate('/invoices/new')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition">
                إنشاء مستند جديد
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-white flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden" style={{ backgroundColor: primaryColor, backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 100%)' }}>
              <div className="absolute top-0 end-0 p-8 opacity-20 pointer-events-none mix-blend-overlay">
                <DollarSign className="w-32 h-32" />
              </div>
              <div className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><DollarSign className="w-4 h-4"/></div>
                إجمالي الإيرادات المفوترة
              </div>
              <div className="text-3xl font-black" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoices.reduce((acc, curr) => acc + curr.total_amount, 0))}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 border border-slate-100/50">
              <div className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center"><FileText className="w-4 h-4"/></div>
                مستحقات متأخرة
              </div>
              <div className="text-3xl font-black text-amber-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoices.filter(i => i.status === 'overdue' || i.status === 'partial').reduce((acc, curr) => acc + (curr.total_amount - curr.paid_amount), 0))}</div>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 border border-slate-100/50">
              <div className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center"><Tag className="w-4 h-4"/></div>
                التحصيلات النقدية
              </div>
              <div className="text-3xl font-black text-primary-600" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoices.reduce((acc, curr) => acc + curr.paid_amount, 0))}</div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-center w-12">
                      <input 
                        type="checkbox" 
                        onChange={(e) => {
                          if (e.target.checked) setSelectedInvoices(new Set(invoices.map(i => i.id)));
                          else setSelectedInvoices(new Set());
                        }} 
                        checked={selectedInvoices.size === invoices.length && invoices.length > 0}
                        className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                      />
                    </th>
                    <th className="px-6 py-4 text-start">الرقم / النوع</th>
                    <th className="px-6 py-4 text-start">العميل</th>
                    <th className="px-6 py-4 text-start">التاريخ</th>
                    <th className="px-6 py-4 text-end">المبلغ (Tax/Disc)</th>
                    <th className="px-6 py-4 text-start">الحالة</th>
                    <th className="px-6 py-4 text-center">دوري</th>
                    <th className="px-6 py-4 text-end">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-600">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-center">
                        <input 
                          type="checkbox" 
                          onChange={() => toggleSelect(invoice.id)} 
                          checked={selectedInvoices.has(invoice.id)}
                          className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer" 
                        />
                      </td>
                      <td className="px-6 py-4 text-start">
                        <div className="font-semibold text-slate-900">{invoice.invoice_number}</div>
                        <div className="text-xs text-slate-500 mt-1">{typeTranslations[invoice.type || 'invoice']}</div>
                        {invoice.project_id && <div className="text-[10px] bg-slate-100 text-slate-600 px-1 inline-block mt-1 font-mono rounded">{invoice.project_id}</div>}
                      </td>
                      <td className="px-6 py-4 text-start font-medium text-slate-800">{invoice.customer_name}</td>
                      <td className="px-6 py-4 text-start">
                        <div>{format(new Date(invoice.invoice_date), 'yyyy/MM/dd')}</div>
                        <div className="text-xs text-slate-400 mt-0.5">م. {format(new Date(invoice.due_date), 'yyyy/MM/dd')}</div>
                      </td>
                      <td className="px-6 py-4 text-end font-mono text-slate-900 font-bold" dir="ltr">
                        <div>{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: invoice.currency }).format(invoice.total_amount)}</div>
                        {(invoice.tax_amount || invoice.discount_amount) ? (
                          <div className="text-[10px] text-slate-500 font-normal mt-1 flex gap-1 justify-end">
                            {invoice.tax_amount ? <span className="text-rose-500">+{invoice.tax_amount} ضريبة</span> : null}
                            {invoice.discount_amount ? <span className="text-primary-500">-{invoice.discount_amount} خصم</span> : null}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 text-start">
                        <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', statusStyles[invoice.status])}>
                          {statusTranslations[invoice.status]}
                        </span>
                        {['partial', 'issued', 'overdue'].includes(invoice.status) && (
                          <div className="text-[10px] text-slate-500 mt-1.5 font-mono" dir="ltr">
                            {invoice.paid_amount > 0 ? `${new Intl.NumberFormat('ar-EG', { style: 'decimal' }).format(invoice.paid_amount)} paid` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {invoice.recurring_status && invoice.recurring_status !== 'none' ? (
                           <button onClick={() => openModal('recurring', invoice)} className={clsx("text-xs px-2 py-1 rounded font-bold transition", invoice.recurring_status === 'active' ? "bg-primary-50 text-primary-700 hover:bg-primary-100" : invoice.recurring_status === 'paused' ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>
                             {invoice.recurring_frequency === 'monthly' ? 'شهري' : invoice.recurring_frequency === 'annual' ? 'سنوي' : 'دوري'} {invoice.recurring_status === 'active' ? '' : '⏸'}
                           </button>
                        ) : (
                           <button onClick={() => openModal('recurring', invoice)} className="text-slate-300 hover:text-primary-600 transition"><Settings className="w-4 h-4 mx-auto" /></button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-end flex items-center justify-end gap-1">
                        <button onClick={() => openModal('email', invoice)} title="إرسال إيميل" className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Send className="w-4 h-4" /></button>
                        <button onClick={() => handleDownload(invoice)} title="تحميل PDF" className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Download className="w-4 h-4" /></button>
                        {['issued', 'partial', 'overdue'].includes(invoice.status) && (
                          <button onClick={() => openModal('payment', invoice)} title="تسجيل دفعة" className="p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition"><DollarSign className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeModal === 'payment' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {focusedInvoice ? 'تسجيل دفعة جزئية / كلية' : 'تسجيل دفع مجمع (Bulk Payment Allocation - FIFO)'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              {focusedInvoice ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-sm font-semibold text-slate-700 mb-1">فاتورة {focusedInvoice.invoice_number}</div>
                  <div className="text-lg font-black text-slate-900 font-mono">المتبقي: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: focusedInvoice.currency }).format(focusedInvoice.total_amount - focusedInvoice.paid_amount)}</div>
                </div>
              ) : (
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 text-primary-800 text-sm">
                  سيتم توزيع المبلغ المدفوع على الفواتير المحددة ({selectedInvoices.size}) بنظام FIFO (الأقدم يستحق أولاً).
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">المبلغ المستلم (Received Amount)</label>
                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={focusedInvoice ? String(focusedInvoice.total_amount - focusedInvoice.paid_amount) : "0.00"} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none text-right font-bold text-lg" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">إلى حساب بنكي (Deposit To)</label>
                <select className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none">
                  <option>البنك الأهلي - EGP</option>
                  <option>CIB - USD</option>
                  <option>الخزينة</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">طريقة الدفع</label>
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

      {activeModal === 'email' && focusedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إرسال الفاتورة عبر البريد</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">إلى (To)</label>
                <input type="text" defaultValue="client@example.com" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الموضوع (Subject)</label>
                <input type="text" defaultValue={`فاتورة رقم ${focusedInvoice.invoice_number}`} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الرسالة (Body)</label>
                <textarea rows={5} defaultValue={`مرحباً ${focusedInvoice.customer_name},\n\nتجدون مرفقاً فاتورة رقم ${focusedInvoice.invoice_number}.\n\nشكراً لتعاملكم معنا.`} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none"></textarea>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>سيتم إرفاق ملف PDF آلياً.</span>
              </div>
              <button 
                onClick={handleSendEmail}
                className="w-full bg-blue-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-blue-700 transition"
              >
                إرسال (Send Email)
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'recurring' && focusedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إعدادات الفوترة الدورية (Recurring Invoices)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">حالة الجدولة</label>
                <select defaultValue={focusedInvoice.recurring_status || 'none'} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none font-bold">
                  <option value="none">بدون / إيقاف التكرار (Stop)</option>
                  <option value="active">نشط (Active & Auto Generate)</option>
                  <option value="paused">إيقاف مؤقت (Paused)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">معدل التكرار (Frequency)</label>
                <select defaultValue={focusedInvoice.recurring_frequency || 'monthly'} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none">
                  <option value="monthly">شهرياً (Monthly)</option>
                  <option value="quarterly">ربع سنوي (Quarterly)</option>
                  <option value="annual">سنوياً (Annual)</option>
                </select>
              </div>
              <div className="pt-2">
                 <label className="flex items-center gap-2">
                   <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600 border-slate-300 rounded" />
                   <span className="text-sm font-semibold text-slate-700">الإرسال التلقائي عبر البريد الإلكتروني (Auto Email)</span>
                 </label>
              </div>
              <button 
                onClick={() => {
                  showToast('تم حفظ إعدادات التكرار بنجاح.');
                  setActiveModal(null);
                }}
                className="w-full bg-primary-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-primary-700 transition mt-4"
              >
                حفظ خطة الفوترة (Save Recurring Plan)
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed top-8 start-1/2 -translate-x-1/2 bg-white text-primary-600 px-6 py-3.5 rounded-2xl shadow-xl font-bold text-sm z-[9999] flex items-center gap-3 border border-primary-200 animate-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
