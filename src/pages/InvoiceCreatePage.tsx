import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Plus, Trash2, Save, Send } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function InvoiceCreatePage() {
  const navigate = useNavigate();
  const [lines, setLines] = useState([{ id: 1, description: "", quantity: 1, price: 0 }]);
  const [type, setType] = useState('invoice');
  const [currency, setCurrency] = useState('EGP');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');

  const addLine = () => {
    setLines([...lines, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const removeLine = (id: number) => {
    setLines(lines.filter(line => line.id !== id));
  };

  const updateLine = (id: number, field: string, value: string | number) => {
    setLines(lines.map(line => line.id === id ? { ...line, [field]: value } : line));
  };

  const subtotal = lines.reduce((acc, line) => acc + (line.quantity * line.price), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * 0.14; // 14% VAT typical for Egypt
  const total = taxableAmount + tax;

  const handleSave = async (status: string) => {
    const customerNames: Record<string, string> = {
      "1": "بوهيميان جيكس (Bohemian Geeks)",
      "2": "Sealy KSA",
      "3": "TechFlow Inc"
    };

    const payload = {
      type,
      customer_name: customerNames[customerId] || 'عميل نقدي',
      invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
      due_date: dueDate || new Date().toISOString().split('T')[0],
      currency,
      project_id: projectId || undefined,
      total_amount: total,
      tax_amount: tax,
      discount_amount: discountAmount,
      status,
      paid_amount: 0,
      recurring_status: 'none'
    };

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate('/invoices');
      } else {
        throw new Error('API failed');
      }
    } catch (err) {
      console.error(err);
      // Fallback for Vercel static hosting
      const localInvoices = JSON.parse(localStorage.getItem(getCompanyKey('mock_invoices')) || '[]');
      if (localInvoices.length === 0) {
         localInvoices.push(
            { id: 1, type: 'invoice', invoice_number: 'BGK-INV-2026-00001', customer_name: 'Bohemian Geeks', total_amount: 15400, paid_amount: 15400, tax_amount: 1400, discount_amount: 0, status: 'paid', invoice_date: '2026-05-10', due_date: '2026-05-24', currency: 'EGP' },
            { id: 2, type: 'invoice', invoice_number: 'O2N-INV-2026-00001', customer_name: 'TechFlow Inc', total_amount: 45000, paid_amount: 20000, tax_amount: 5000, discount_amount: 2000, status: 'partial', invoice_date: '2026-05-15', due_date: '2026-05-30', currency: 'EGP' },
            { id: 3, type: 'quotation', invoice_number: 'BGK-QT-2026-00002', customer_name: 'Sealy KSA', total_amount: 120500, paid_amount: 0, tax_amount: 15000, discount_amount: 5000, status: 'draft', invoice_date: '2026-06-01', due_date: '2026-06-15', currency: 'SAR' },
            { id: 4, type: 'proforma', invoice_number: 'BGK-PRO-2026-00001', customer_name: 'Tech Solutions', total_amount: 85000, paid_amount: 0, tax_amount: 10000, discount_amount: 0, status: 'pending_approval', invoice_date: '2026-06-10', due_date: '2026-06-20', currency: 'EGP' }
         );
      }
      const newId = Math.max(0, ...localInvoices.map((i: any) => i.id || 0)) + 1;
      const finalPayload = { ...payload, id: newId, invoice_number: `BGK-INV-2026-${String(newId).padStart(5, '0')}` };
      localInvoices.push(finalPayload);
      localStorage.setItem(getCompanyKey('mock_invoices'), JSON.stringify(localInvoices));
      navigate('/invoices');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/invoices')} className="text-slate-400 hover:text-slate-600 transition bg-white p-2 border border-slate-200 rounded-lg">
            <ArrowRight className="w-5 h-5 " />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">إنشاء مستند جديد</h2>
            <p className="text-sm text-slate-500 mt-0.5">فاتورة، عرض سعر، مسودة</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleSave('draft')} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2">
             <Save className="w-4 h-4"/> مسودة
           </button>
           <button onClick={() => handleSave('pending_approval')} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-200 transition">
             طلب موافقة
           </button>
           <button onClick={() => handleSave('issued')} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2">
             <Send className="w-4 h-4" /> إصدار نهائي
           </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الشركة (Company)</label>
            <select defaultValue="BGK" className="w-full bg-primary-50 border border-primary-200 text-primary-900 font-bold text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
              <option value="BGK">Bohemian Geeks (BGK)</option>
              <option value="O2N">O2Nation (O2N)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نوع المستند (Type)</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-primary-50 border border-primary-100 text-primary-900 font-bold text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
              <option value="invoice">فاتورة ضريبية (Invoice)</option>
              <option value="quotation">عرض سعر (Quotation)</option>
              <option value="proforma">فاتورة مبدئية (Proforma)</option>
              <option value="advance">دفعة مقدمة (Advance)</option>
              <option value="credit_note">إشعار دائن (Credit Note)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم المستند</label>
            <input type="text" defaultValue="BGK-INV-2026-00003" disabled className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">العميل</label>
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
              <option value="" disabled>اختر العميل...</option>
              <option value="1">بوهيميان جيكس (Bohemian Geeks)</option>
              <option value="2">Sealy KSA</option>
              <option value="3">TechFlow Inc</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الإصدار</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الاستحقاق</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">العملة (Currency)</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
            </select>
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">سعر الصرف (إذا لزم)</label>
             <input type="number" defaultValue="1" disabled={currency === 'EGP'} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none text-right" dir="ltr" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">مركز التكلفة (Cost Center)</label>
              <select defaultValue="" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                <option value="">بدون مركز تكلفة</option>
                <option value="FR">فرع الرياض (FR)</option>
                <option value="HQ">المركز الرئيسي (HQ)</option>
              </select>
           </div>
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">ارتباط بمشروع (Project Tracking)</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                <option value="">لا يوجد ارتباط</option>
                <option value="PRJ-001">مشروع تطوير المنصة (PRJ-001)</option>
                <option value="PRJ-002">حملة تسويق 2026 (PRJ-002)</option>
              </select>
           </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full flex justify-between">
               <span>بنود الفاتورة</span>
               <button onClick={addLine} className="flex items-center space-x-2  text-primary-600 font-semibold text-sm hover:text-primary-700">
                 <Plus className="w-4 h-4" />
                 <span>إضافة بند</span>
               </button>
            </h3>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start w-1/2">الوصف</th>
                  <th className="px-4 py-3 text-start w-24">الكمية</th>
                  <th className="px-4 py-3 text-start w-32">السعر الوحدة</th>
                  <th className="px-4 py-3 text-end w-32">الإجمالي</th>
                  <th className="px-4 py-3 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                {lines.map((line) => (
                  <tr key={line.id} className="bg-white group">
                    <td className="p-2">
                      <input 
                        type="text" 
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        placeholder="وصف الخدمة أو المنتج..."
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors text-start"
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="0"
                        value={line.price}
                        onChange={(e) => updateLine(line.id, 'price', Number(e.target.value))}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors text-start"
                        dir="ltr"
                      />
                    </td>
                    <td className="p-2 text-end font-mono font-medium" dir="ltr">
                      {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(line.quantity * line.price)}
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeLine(line.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
           <div className="w-full md:w-1/2">
             <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات العميل / الشروط</label>
             <textarea rows={4} placeholder="شروط الدفع والملاحظات الإضافية التي تظهر للعميل في الفاتورة..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
           </div>
           
           <div className="w-full md:w-80 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between mb-3 text-sm text-slate-600 border-b border-slate-200 pb-3">
              <span>المجموع الفرعي</span>
              <span className="font-mono font-medium" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center mb-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>خصم خاص %</span>
                <input type="number" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="w-16 bg-white border border-slate-200 rounded px-2 py-1 text-xs text-center outline-none" min="0" max="100"/>
              </div>
              <span className="font-mono font-medium text-emerald-600" dir="ltr">-{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(discountAmount)}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm text-slate-600">
              <span>ضريبة القيمة المضافة (14%)</span>
              <span className="font-mono font-medium text-rose-600" dir="ltr">+{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(tax)}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>الإجمالي الكلي</span>
              <span className="font-mono text-xl text-primary-700" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
