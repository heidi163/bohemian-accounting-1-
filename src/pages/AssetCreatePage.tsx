import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Save } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function AssetCreatePage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    asset_code: `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    location: "",
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: "",
    depreciation_method: "straight_line",
    useful_life_years: 5,
    salvage_value: ""
  });

  const handleSave = async () => {
    if (!form.name || !form.purchase_price) return;
    setIsProcessing(true);
    const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
    if (localAssets.length === 0) {
      localAssets.push(
        { id: "1", asset_code: "AST-2026-001", name: "سيرفرات ديل (Dell Servers)", category: "", purchase_price: 120000, net_book_value: 90000, accumulated_depreciation: 30000, status: "active", useful_life_years: 4, depreciation_method: "straight_line" },
        { id: "2", asset_code: "AST-2026-002", name: "سيارة نقل مرسيدس", category: "cars", purchase_price: 850000, net_book_value: 850000, accumulated_depreciation: 0, status: "active", useful_life_years: 5, depreciation_method: "straight_line" }
      );
    }
    const newAsset = {
      ...form,
      id: Date.now().toString(),
      purchase_price: Number(form.purchase_price),
      useful_life_years: Number(form.useful_life_years),
      salvage_value: Number(form.salvage_value) || 0,
      accumulated_depreciation: 0,
      net_book_value: Number(form.purchase_price),
      status: 'active'
    };
    localAssets.push(newAsset);
    localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(localAssets));
    navigate("/assets");
    setIsProcessing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-4xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/assets')} className="text-slate-400 hover:text-slate-600 transition bg-white p-2 border border-slate-200 rounded-lg">
            <ArrowRight className="w-5 h-5 " />
          </button>
          <div>
            <h2 className="font-bold text-slate-800 text-lg">تسجيل أصل ثابت جديد</h2>
            <p className="text-sm text-slate-500 mt-0.5">شراء وتكويد وإهلاك الأصول</p>
          </div>
        </div>
        <div className="flex gap-2">
           <button onClick={handleSave} disabled={isProcessing} className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-50">
             <Save className="w-4 h-4"/> {isProcessing ? 'جاري الحفظ...' : 'حفظ وتسجيل الأصل'}
           </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">تفاصيل الأصل</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">اسم أو وصف الأصل</label>
               <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="مثال: سيارة مرسيدس 2026..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">تصنيف الأصل (Category)</label>
               <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                 <option value="computers">أجهزة حاسب وملحقاتها</option>
                 <option value="cars">سيارات ومركبات</option>
                 <option value="equipment">معدات وآلات</option>
                 <option value="furniture">أثاث ومفروشات</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">كود الأصل الداخلي (Asset Code)</label>
               <input type="text" value={form.asset_code} onChange={e => setForm({...form, asset_code: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 outline-none font-mono" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">موقع الأصل (Location)</label>
               <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="المقر الرئيسي، فرع الرياض..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
             </div>
           </div>
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">بيانات الشراء</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ الشراء / وتاريخ بدء الإهلاك</label>
               <input type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">تكلفة الشراء الأصلية (Purchase Price)</label>
               <input type="number" value={form.purchase_price} onChange={e => setForm({...form, purchase_price: e.target.value})} placeholder="0.00" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-right font-mono" dir="ltr" />
             </div>
           </div>
        </div>

        <div>
           <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">إعدادات الإهلاك (Depreciation Schedule)</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">طريقة الإهلاك (Method)</label>
               <select value={form.depreciation_method} onChange={e => setForm({...form, depreciation_method: e.target.value})} className="w-full bg-primary-50 border border-primary-100 text-primary-900 font-bold text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all">
                 <option value="straight_line">قسط ثابت (Straight Line)</option>
                 <option value="declining_balance">رصيد متناقص (Declining Balance)</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">العمر الإنتاجي بالسنوات (Useful Life)</label>
               <input type="number" value={form.useful_life_years} onChange={e => setForm({...form, useful_life_years: Number(e.target.value)})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-center" />
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">القيمة التخريدية (Salvage Value)</label>
               <input type="number" value={form.salvage_value} onChange={e => setForm({...form, salvage_value: e.target.value})} placeholder="0.00" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-right font-mono" dir="ltr" />
               <p className="text-xs text-slate-500 mt-1">القيمة المتبقية بعد الإهلاك التام.</p>
             </div>
           </div>
           
           <div className="mt-6 bg-slate-100 p-4 rounded-xl text-sm text-slate-600 flex items-center gap-2 border border-slate-200">
              <span className="bg-white p-1 rounded"></span>
              الأنظمة ستقوم آلياً بحساب الإهلاك شهرياً بناءً على الطريقة المختارة وإصدار قيد يومية من (مصروف الإهلاك) إلى (مجمع الإهلاك).
           </div>
        </div>

      </div>
    </div>
  );
}
