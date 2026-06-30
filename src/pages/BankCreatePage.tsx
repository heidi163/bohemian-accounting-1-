import { toast } from 'react-hot-toast';
import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function BankCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: 'bank',
    name: '',
    code: '',
    balance: 0,
    currency: 'EGP',
    accountNumber: ''
  });

  const handleSave = async () => {
    if (!form.name || !form.code) return;
    
    const payload = {
      code: form.code,
      name: form.name,
      type: form.type,
      currency: form.currency,
      balance: Number(form.balance),
      company_id: 'ALL'
    };

    const localBanks = JSON.parse(localStorage.getItem(getCompanyKey('mock_banks')) || '[]');
    if (localBanks.length === 0) {
      localBanks.push(
        { id: "1", code: "1111", name: "البنك الأهلي - EGP", type: "bank", currency: "EGP", balance: 1500000, company_id: "BGK" },
        { id: "2", code: "1112", name: "بنك الراجحي - SAR", type: "bank", currency: "SAR", balance: 250000, company_id: "BGK" },
        { id: "3", code: "1113", name: "CIB - USD", type: "bank", currency: "USD", balance: 45000, company_id: "O2N" },
        { id: "4", code: "1121", name: "صندوق المركز الرئيسي", type: "cash", currency: "EGP", balance: 25000, company_id: "ALL" }
      );
    }
    
    const newBank = { ...payload, id: Date.now().toString() };
    localBanks.push(newBank);
    localStorage.setItem(getCompanyKey('mock_banks'), JSON.stringify(localBanks));
    
    toast.success("تم إضافة الحساب بنجاح!");
    navigate('/banks');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/banks')} className="text-slate-400 hover:text-slate-600 transition">
            <ArrowRight className="w-6 h-6 " />
          </button>
          <h2 className="font-bold text-slate-800 text-lg">إضافة حساب بنكي / نقدية جديد</h2>
        </div>
        <button className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition" onClick={handleSave}>
          حفظ الحساب
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">نوع الحساب</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
              <option value="bank">حساب بنكي</option>
              <option value="cash">خزينة / نقدية</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">اسم الحساب (مثال: البنك الأهلي - EGP)</label>
            <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم الحساب..." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">كود الحساب (دليل الحسابات)</label>
            <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="1111" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الرصيد الافتتاحي</label>
            <input type="number" value={form.balance} onChange={e => setForm({...form, balance: Number(e.target.value)})} placeholder="0" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">العملة</label>
            <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
              <option value="EGP">جنيه مصري (EGP)</option>
              <option value="USD">دولار أمريكي (USD)</option>
              <option value="SAR">ريال سعودي (SAR)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">رقم الحساب البنكي (اختياري)</label>
            <input type="text" value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} placeholder="IBAN أو رقم الحساب" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
          </div>
        </div>
      </div>
    </div>
  );
}
