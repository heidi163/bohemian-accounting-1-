import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Plus, Trash2, Save, Send } from "lucide-react";

export function PurchaseCreatePage() {
  const navigate = useNavigate();
  const [lines, setLines] = useState([{ id: 1, description: "", quantity: 1, price: 0 }]);
  const [currency, setCurrency] = useState('EGP');

  const addLine = () => {
    setLines([...lines, { id: Date.now(), description: "", quantity: 1, price: 0 }]);
  };

  const removeLine = (id: number) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: number, field: string, value: string | number) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const subtotal = lines.reduce((acc, line) => acc + (line.quantity * line.price), 0);
  const tax = subtotal * 0.14; // 14% VAT typical for Egypt
  const total = subtotal + tax;

  const handleSave = (status: string) => {
    if (status === 'draft') {
        alert('تم حفظ الفاتورة كمسودة.');
    } else {
        alert('تم إرسال الفاتورة للاعتماد (Pending Approval).');
    }
    navigate('/purchases');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/purchases')} className="text-slate-400 hover:text-slate-600 transition bg-white p-2 border border-slate-200 rounded-lg">
            <ArrowRight className="w-5 h-5 " />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">تسجيل فاتورة مشتريات (Bill)</h2>
            <p className="text-sm text-slate-500 mt-0.5">إثبات مديونية مورد</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleSave('draft')} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2">
             <Save className="w-4 h-4"/> مسودة
           </button>
           <button onClick={() => handleSave('pending_approval')} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-200 transition flex items-center gap-2">
             <Send className="w-4 h-4" /> طلب اعتماد الفاتورة
           </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">المورد (Supplier)</label>
            <select defaultValue="" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
              <option value="" disabled>اختر المورد...</option>
              <option value="1">Amazon Web Services</option>
              <option value="2">Google Ads</option>
              <option value="3">Office Supplies Co.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم فاتورة المورد (Ref)</label>
            <input type="text" placeholder="رقم الفاتورة الأصلية..." className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الرقم الداخلي المولد</label>
            <input type="text" defaultValue="BILL-2026-00004" disabled className="w-full bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-xl px-4 py-2.5 outline-none" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الفاتورة (Bill Date)</label>
            <input type="date" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الاستحقاق (Due Date)</label>
            <input type="date" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
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
             <label className="block text-sm font-medium text-slate-700 mb-2">مركز التكلفة (Cost Center)</label>
             <select defaultValue="" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
               <option value="">بدون (عام)</option>
               <option value="FR">فرع الرياض (FR)</option>
               <option value="HQ">المركز الرئيسي (HQ)</option>
             </select>
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 w-full flex justify-between">
               <span>البنود (Items / Accounts)</span>
               <button onClick={addLine} className="flex items-center space-x-2  text-primary-600 font-semibold text-sm hover:text-primary-700">
                 <Plus className="w-4 h-4" />
                 <span>إضافة بند الصرف</span>
               </button>
            </h3>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-start border-collapse">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-start">حساب المصروف / الصنف</th>
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
                      <select 
                        value={line.description}
                        onChange={(e) => updateLine(line.id, 'description', e.target.value)}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors"
                      >
                         <option value="">اختر حساب المصروف...</option>
                         <option value="مصروفات تسويق">مصروفات تسويق</option>
                         <option value="إيجار مقر">إيجار مقر</option>
                         <option value="اشتراكات برمجيات">اشتراكات برمجيات (SaaS)</option>
                         <option value="أدوات مكتبية">أدوات مكتبية وقرطاسية</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, 'quantity', Number(e.target.value))}
                        className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-primary-500 rounded-lg px-3 py-1.5 outline-none transition-colors text-center"
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
           <div className="w-full md:w-1/2 space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">ملاحظات داخلية</label>
               <textarea rows={4} placeholder="وصف لأسباب الصرف أو ملاحظات للإدارة المالية..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">مرفقات (صورة الفاتورة)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition cursor-pointer">
                    <p className="text-xs text-slate-500 font-bold mb-1">اضغط هنا لرفع مرفق الفاتورة (أو اسحب الإفلات)</p>
                    <p className="text-xs text-slate-400">يدعم PDF و JPG و PNG</p>
                </div>
             </div>
           </div>
           
           <div className="w-full md:w-80 bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex justify-between mb-3 text-sm text-slate-600 border-b border-slate-200 pb-3">
              <span>المجموع الفرعي</span>
              <span className="font-mono font-medium" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span>ضريبة القيمة المضافة المدخلات (VAT)</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-primary-600" />
              </div>
              <span className="font-mono font-medium text-rose-600" dir="ltr">+{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(tax)}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex justify-between font-bold text-slate-900">
              <span>صافي المستحق للمورد</span>
              <span className="font-mono text-xl text-rose-700" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: currency }).format(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
