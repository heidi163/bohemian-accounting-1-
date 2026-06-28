import { useState } from "react";
import { Banknote, Calculator, UserCheck, Clock, AlertCircle, Plus, Trash2, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

const mockAdvances = [
  { id: 1, employee: "أحمد محمود", amount: 3000, date: "2026-05-15", reason: "ظروف اجتماعية", remaining: 2000, status: "active" },
  { id: 2, employee: "سارة خالد", amount: 5000, date: "2026-04-01", reason: "تسديد إيجار", remaining: 0, status: "cleared" },
  { id: 3, employee: "محمد فتحي", amount: 2500, date: "2026-06-01", reason: "علاج طبي", remaining: 2500, status: "active" },
];

export function EmployeeAdvancesPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee: "", amount: "", reason: "", recovery_months: "3", bank_account: "" });
  const [advances, setAdvances] = useState(mockAdvances);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.amount) { alert("يرجى تعبئة جميع الحقول المطلوبة."); return; }
    setAdvances(prev => [...prev, {
      id: Date.now(),
      employee: form.employee,
      amount: Number(form.amount),
      date: new Date().toISOString().split("T")[0],
      reason: form.reason,
      remaining: Number(form.amount),
      status: "active",
    }]);
    alert(`تم تسجيل سلفة بمبلغ ${form.amount} EGP للموظف ${form.employee}.\nسيتم استقطاعها على ${form.recovery_months} أشهر.`);
    setShowForm(false);
    setForm({ employee: "", amount: "", reason: "", recovery_months: "3", bank_account: "" });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2">
            <Banknote className="w-7 h-7 text-primary-600" /> السُّلَف (Employee Advances)
          </h2>
          <p className="text-slate-500 mt-1">إدارة سلف الموظفين واستقطاعاتها الشهرية من الرواتب.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white font-bold py-2 px-5 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition"
        >
          <Plus className="w-4 h-4" /> تسجيل سلفة جديدة
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-primary-200 p-6">
          <h3 className="font-bold text-slate-800 mb-5 text-lg flex items-center gap-2"><Plus className="w-5 h-5 text-primary-600" /> تفاصيل السلفة الجديدة</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الموظف *</label>
              <select value={form.employee} onChange={e => setForm({ ...form, employee: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">اختر الموظف...</option>
                <option>أحمد محمود</option>
                <option>سارة خالد</option>
                <option>محمد فتحي</option>
                <option>ياسمين إبراهيم</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ (EGP) *</label>
              <input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">استقطاع على (أشهر)</label>
              <select value={form.recovery_months} onChange={e => setForm({ ...form, recovery_months: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none">
                <option value="1">شهر واحد</option>
                <option value="2">شهران</option>
                <option value="3">3 أشهر</option>
                <option value="6">6 أشهر</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">سبب السلفة</label>
              <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="مثال: ظروف طارئة، علاج طبي..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الصرف من</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none">
                <option>BGK-EGP (الحساب الجاري)</option>
                <option>CASH (الخزينة)</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition text-sm">إلغاء</button>
              <button type="submit" className="px-6 py-2 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition text-sm">تأكيد وإنشاء قيد محاسبي</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-bold uppercase">إجمالي السلف الممنوحة</div>
          <div className="text-2xl font-black text-slate-900">10,500 EGP</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-bold uppercase">المتبقي للاستقطاع</div>
          <div className="text-2xl font-black text-rose-600">4,500 EGP</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs text-slate-500 mb-1 font-bold uppercase">سلف نشطة</div>
          <div className="text-2xl font-black text-primary-600">2</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-start">الموظف</th>
              <th className="px-6 py-4 text-start">التاريخ</th>
              <th className="px-6 py-4 text-start">السبب</th>
              <th className="px-6 py-4 text-end">المبلغ</th>
              <th className="px-6 py-4 text-end">المتبقي</th>
              <th className="px-6 py-4 text-center">الحالة</th>
              <th className="px-6 py-4 text-end">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {advances.map(adv => (
              <tr key={adv.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2"><UserCheck className="w-4 h-4 text-slate-400" />{adv.employee}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{adv.date}</td>
                <td className="px-6 py-4 text-slate-600">{adv.reason}</td>
                <td className="px-6 py-4 text-end font-mono font-bold text-slate-800" dir="ltr">{adv.amount.toLocaleString()} EGP</td>
                <td className="px-6 py-4 text-end font-mono font-bold" dir="ltr">
                  <span className={clsx(adv.remaining > 0 ? "text-rose-600" : "text-emerald-600")}>
                    {adv.remaining.toLocaleString()} EGP
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={clsx("px-2 py-1 rounded text-xs font-bold", adv.status === "active" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600")}>
                    {adv.status === "active" ? "نشط" : "مُسدَّد"}
                  </span>
                </td>
                <td className="px-6 py-4 text-end">
                  <button onClick={() => alert(`جاري تحميل تفاصيل سلفة ${adv.employee}`)} className="text-primary-600 hover:underline text-xs font-bold">تفاصيل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
