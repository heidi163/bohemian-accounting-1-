import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { type SubContact } from "../types";

export function ContactCreatePage() {
  const navigate = useNavigate();
  const [subContacts, setSubContacts] = useState<SubContact[]>([]);

  const addSubContact = () => {
    setSubContacts([...subContacts, { name: '', email: '', phone: '' }]);
  };

  const removeSubContact = (index: number) => {
    setSubContacts(subContacts.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/contacts')} className="text-slate-400 hover:text-slate-600 transition bg-white p-2 border border-slate-200 rounded-lg">
            <ArrowRight className="w-5 h-5 " />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">إضافة جهة اتصال جديدة</h2>
            <p className="text-sm text-slate-500 mt-0.5">عميل أو مورد جديد</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-slate-100 text-slate-700 px-6 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition" onClick={() => navigate('/contacts')}>
             إلغاء
          </button>
          <button className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition" onClick={() => {
             alert('تم حفظ البيانات بنجاح!');
             navigate('/contacts');
          }}>
            حفظ وإنشاء
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">البيانات الأساسية</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">النوع</label>
               <select defaultValue="customer" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
                 <option value="customer">عميل (Customer)</option>
                 <option value="supplier">مورد (Supplier)</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">الشركة أو الجهة الرئيسية</label>
               <input type="text" placeholder="اسم الشركة أو العميل..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني الرئيسي</label>
               <input type="email" placeholder="example@domain.com" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف الرئيسي</label>
               <input type="tel" placeholder="+20 100 000 0000" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">الرقم الضريبي</label>
               <input type="text" placeholder="123-456-789" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">العملة الافتراضية</label>
               <select defaultValue="EGP" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
                 <option value="EGP">جنيه مصري (EGP)</option>
                 <option value="USD">دولار أمريكي (USD)</option>
                 <option value="SAR">ريال سعودي (SAR)</option>
               </select>
             </div>
           </div>
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">الإعدادات المالية</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">الرصيد الافتتاحي (Opening Balance)</label>
               <input type="number" placeholder="0.00" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-right" dir="ltr" />
               <p className="text-xs text-slate-500 mt-1">يُسجل في تاريخ بدء التفعيل.</p>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">الحد الائتماني (Credit Limit)</label>
               <input type="number" placeholder="مثال: 50000" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-right" dir="ltr" />
               <p className="text-xs text-slate-500 mt-1">أقصى مبلغ مسموح للمديونية.</p>
             </div>
           </div>
        </div>

        <div>
           <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
             <h3 className="text-lg font-bold text-slate-800">جهات الاتصال التابعة (Multiple Contacts)</h3>
             <button onClick={addSubContact} className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition flex items-center gap-1"><Plus className="w-4 h-4"/> إضافة جهة احتياطية</button>
           </div>
           
           {subContacts.length === 0 ? (
             <div className="text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-slate-500 text-sm">
                لا توجد جهات اتصال تابعة حالياً. يمكنك إضافة موظفين أو ممثلين آخرين.
             </div>
           ) : (
             <div className="space-y-4">
               {subContacts.map((_, index) => (
                 <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-xl border border-slate-200">
                   <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <input type="text" placeholder={`الاسم #${index + 1}`} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2 outline-none" />
                     <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2 outline-none text-right" dir="ltr" />
                     <input type="tel" placeholder="رقم الهاتف" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2 outline-none text-right" dir="ltr" />
                   </div>
                   <button onClick={() => removeSubContact(index)} className="text-rose-500 hover:text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-100 transition">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">بيانات إضافية</h3>
           <div className="md:col-span-2">
             <label className="block text-sm font-medium text-slate-700 mb-2">العنوان وملاحظات</label>
             <textarea rows={3} placeholder="عنوان الشارع، المدينة، أية ملاحظات إضافية..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
           </div>
        </div>
      </div>
    </div>
  );
}
