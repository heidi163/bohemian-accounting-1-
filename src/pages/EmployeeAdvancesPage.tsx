import { toast } from 'react-hot-toast';
import { useState, useEffect } from "react";
import { Banknote, Calculator, UserCheck, Clock, AlertCircle, Plus, Trash2, ChevronDown, CheckCircle2, FileText, X, Wallet } from "lucide-react";
import { clsx } from "clsx";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

export function EmployeeAdvancesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", amount: "", reason: "", recovery_months: "3", bank_account: "" });
  const [advances, setAdvances] = useState<any[]>([]);

  useEffect(() => {
    const activeCompany = getActiveCompany();
    const defaults = [
      { id: 1, employee: "أحمد محمود", amount: 3000, date: "2026-05-15", reason: "ظروف اجتماعية", remaining: 2000, status: "active", company_id: 'O2N' },
      { id: 2, employee: "سارة خالد", amount: 5000, date: "2026-04-01", reason: "تسديد إيجار", remaining: 0, status: "cleared", company_id: 'O2N' },
      { id: 3, employee: "محمد فتحي", amount: 2500, date: "2026-06-01", reason: "علاج طبي", remaining: 2500, status: "active", company_id: 'BGK' },
    ];

    const local = JSON.parse(localStorage.getItem(getCompanyKey('mock_advances')) || '[]');
    if (local.length > 0) {
      setAdvances(local.filter((a: any) => a.company_id === activeCompany || !a.company_id));
    } else {
      localStorage.setItem(getCompanyKey('mock_advances'), JSON.stringify(defaults));
      setAdvances(defaults.filter((a: any) => a.company_id === activeCompany));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.amount) { toast.error("يرجى تعبئة جميع الحقول المطلوبة."); return; }
    
    const activeCompany = getActiveCompany();
    const newAdvance = {
      id: Date.now(),
      employee: form.employee,
      amount: Number(form.amount),
      date: new Date().toISOString().split("T")[0],
      reason: form.reason,
      remaining: Number(form.amount),
      status: "active",
      company_id: activeCompany
    };
    
    const allAdvances = JSON.parse(localStorage.getItem(getCompanyKey('mock_advances')) || '[]');
    const updatedAdvances = [newAdvance, ...allAdvances];
    localStorage.setItem(getCompanyKey('mock_advances'), JSON.stringify(updatedAdvances));
    
    setAdvances([newAdvance, ...advances]);
    
    toast.success(`تم تسجيل سلفة بمبلغ ${form.amount} EGP للموظف ${form.employee}.\nسيتم استقطاعها على ${form.recovery_months} أشهر.`);
    setShowForm(false);
    setForm({ employee: "", amount: "", reason: "", recovery_months: "3", bank_account: "" });
  };

  // KPIs Calculation
  const totalGranted = advances.reduce((sum, adv) => sum + adv.amount, 0);
  const totalRemaining = advances.reduce((sum, adv) => sum + adv.remaining, 0);
  const activeCount = advances.filter(adv => adv.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-3">
            <div className="p-3 bg-primary-100 text-primary-700 rounded-2xl">
               <Wallet className="w-6 h-6" />
            </div>
            السُّلَف (Employee Advances)
          </h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة سلف الموظفين واستقطاعاتها الشهرية من الرواتب بشكل آلي.</p>
        </div>
        
        <div className="relative z-10">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 shadow-lg shadow-primary-600/20 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> تسجيل سلفة جديدة
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2rem] shadow-lg shadow-slate-200/50 border border-primary-100 p-8 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
             <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2">
                <Plus className="w-6 h-6 text-primary-600" /> تفاصيل السلفة الجديدة
             </h3>
             <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                <X className="w-5 h-5"/>
             </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الموظف *</label>
              <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm">
                <option value="">اختر الموظف...</option>
                <option>أحمد محمود</option>
                <option>سارة خالد</option>
                <option>ياسمين إبراهيم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ (EGP) *</label>
              <input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">استقطاع على (أشهر)</label>
              <select value={form.recovery_months} onChange={e => setForm({ ...form, recovery_months: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm">
                <option value="1">شهر واحد</option>
                <option value="2">شهران</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">سبب السلفة</label>
              <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="مثال: ظروف طارئة، علاج طبي..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الصرف من</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm">
                <option>BGK-EGP (الحساب الجاري)</option>
                <option>CASH (الخزينة)</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-3 justify-end mt-2 border-t border-slate-100 pt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-sm">إلغاء</button>
              <button type="submit" className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 hover:-translate-y-0.5 shadow-lg shadow-primary-600/20 transition-all text-sm">تأكيد وإنشاء قيد محاسبي</button>
            </div>
          </form>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي السلف الممنوحة</p>
              <h3 className="font-black text-slate-800 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(totalGranted)} EGP</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">المتبقي للاستقطاع</p>
              <h3 className="font-black text-rose-600 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(totalRemaining)} EGP</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">سلف نشطة (قيد السداد)</p>
              <h3 className="font-black text-primary-600 text-3xl">{activeCount}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">سجل السلف</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-start">الموظف</th>
                <th className="px-6 py-4 text-start">التاريخ</th>
                <th className="px-6 py-4 text-start">السبب</th>
                <th className="px-6 py-4 text-end">المبلغ الأصلي</th>
                <th className="px-6 py-4 text-end">المتبقي (EGP)</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {advances.length > 0 ? advances.map(adv => (
                <tr key={adv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      {adv.employee}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start text-slate-600 font-mono text-sm">{adv.date}</td>
                  <td className="px-6 py-4 text-start text-slate-600 font-medium">{adv.reason}</td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-slate-800" dir="ltr">{adv.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-end font-mono font-black" dir="ltr">
                    <span className={clsx(adv.remaining > 0 ? "text-rose-600" : "text-emerald-600")}>
                      {adv.remaining.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "inline-flex items-center rounded-xl px-3 py-1 text-xs font-black", 
                      adv.status === "active" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      {adv.status === "active" ? "نشط" : "مُسدَّد"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <button onClick={() => toast.success(`جاري تحميل تفاصيل سلفة ${adv.employee}`)} className="p-2.5 text-primary-600 hover:bg-primary-50 rounded-xl transition-colors inline-flex">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">لا توجد سلف مسجلة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
