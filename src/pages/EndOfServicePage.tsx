import { useState, useEffect } from "react";
import { Calculator, User, Calendar, DollarSign, FileDown, RefreshCw } from "lucide-react";
import { type Employee } from "../types";

export function EndOfServicePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessingJournal, setIsProcessingJournal] = useState(false);
  const [journalCreated, setJournalCreated] = useState(false);
  
  const [form, setForm] = useState({
    employee_id: "",
    hire_date: "",
    exit_date: new Date().toISOString().split("T")[0],
    basic_salary: "",
    leave_balance: "",
    exit_reason: "resignation",
  });
  const [result, setResult] = useState<null | {
    years: number;
    months: number;
    prorated_salary: number;
    leave_value: number;
    eos_bonus: number;
    total: number;
  }>(null);

  useEffect(() => {
    fetch("/api/employees")
      .then(res => res.json())
      .then(data => setEmployees(data.data));
  }, []);

  const handleEmployeeChange = (employeeId: string) => {
    const emp = employees.find(e => e.id.toString() === employeeId);
    if (emp) {
      setForm({
        ...form,
        employee_id: employeeId,
        hire_date: emp.join_date,
        basic_salary: emp.basic_salary.toString()
      });
      setErrorMsg("");
    } else {
      setForm({ ...form, employee_id: employeeId, hire_date: "", basic_salary: "" });
    }
  };

  const calculate = () => {
    setErrorMsg("");
    if (!form.hire_date || !form.exit_date || !form.basic_salary) {
      setErrorMsg("يرجى إدخال تاريخ التعيين، تاريخ الخروج، والراتب الأساسي.");
      return;
    }
    const hireDate = new Date(form.hire_date);
    const exitDate = new Date(form.exit_date);
    const diffMs = exitDate.getTime() - hireDate.getTime();
    if (diffMs < 0) {
      setErrorMsg("تاريخ المغادرة لا يمكن أن يكون قبل تاريخ التعيين.");
      return;
    }
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalMonths = Math.floor(totalDays / 30.44);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const basic = Number(form.basic_salary);
    const dailySalary = basic / 30;

    // Prorated salary for current month
    const exitDay = exitDate.getDate();
    const prorated_salary = dailySalary * exitDay;

    // Leave value
    const leave_value = (Number(form.leave_balance) || 0) * dailySalary;

    // Egyptian Labor Law: End of Service Bonus
    // - If resignation < 5 years: 0
    // - If resignation 5-10 years: 2/3 * monthly * years
    // - If resignation > 10 years or termination/retirement: full month * years
    let eos_bonus = 0;
    if (form.exit_reason === "termination" || form.exit_reason === "retirement") {
      eos_bonus = basic * years;
    } else if (form.exit_reason === "resignation") {
      if (years < 5) eos_bonus = 0;
      else if (years < 10) eos_bonus = (basic * years) * (2 / 3);
      else eos_bonus = basic * years;
    }

    const total = prorated_salary + leave_value + eos_bonus;
    setResult({ years, months, prorated_salary, leave_value, eos_bonus, total });
    setJournalCreated(false); // Reset on new calculation
  };

  const handleCreateJournal = async () => {
    if (!result) return;
    setIsProcessingJournal(true);
    setErrorMsg("");
    
    const emp = employees.find(e => e.id.toString() === form.employee_id);
    const empName = emp ? emp.name : '';

    try {
      const response = await fetch('/api/journal-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry_number: `JE-EOS-${Date.now().toString().slice(-4)}`,
          entry_date: new Date().toISOString().split('T')[0],
          description: `إثبات مستحقات نهاية الخدمة للموظف ${empName}`,
          total_debit: result.total,
          total_credit: result.total,
          status: 'draft',
          company_id: 'BGK'
        })
      });
      if (response.ok) {
        setJournalCreated(true);
      } else {
        setErrorMsg('حدث خطأ أثناء إنشاء القيد.');
      }
    } catch {
      setErrorMsg('خطأ في الاتصال بالخادم.');
    } finally {
      setIsProcessingJournal(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(n);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2 mb-1">
          <Calculator className="w-7 h-7 text-primary-600" /> حاسبة نهاية الخدمة (End of Service)
        </h2>
        <p className="text-slate-500 text-sm">احتساب مستحقات الموظف وفق قانون العمل المصري.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
          <h3 className="font-bold text-slate-800 mb-2">بيانات الموظف</h3>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg text-sm border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الموظف</label>
            <select value={form.employee_id} onChange={e => handleEmployeeChange(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">اختر الموظف...</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> تاريخ التعيين</label>
              <input type="date" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> تاريخ المغادرة</label>
              <input type="date" value={form.exit_date} onChange={e => setForm({ ...form, exit_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> الراتب الأساسي (EGP)</label>
            <input type="number" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رصيد الإجازات المتبقية (أيام)</label>
            <input type="number" value={form.leave_balance} onChange={e => setForm({ ...form, leave_balance: e.target.value })} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">سبب المغادرة</label>
            <select value={form.exit_reason} onChange={e => setForm({ ...form, exit_reason: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none">
              <option value="resignation">استقالة (Resignation)</option>
              <option value="termination">إنهاء خدمة (Termination)</option>
              <option value="retirement">تقاعد (Retirement)</option>
            </select>
          </div>

          <button onClick={calculate} className="w-full bg-primary-600 text-white font-bold py-3 rounded-xl hover:bg-primary-700 transition flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5" /> احتساب المستحقات
          </button>
        </div>

        {/* Result */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">نتيجة الاحتساب</h3>
          {result ? (
            <div className="space-y-4 flex-1">
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-center">
                <div className="text-sm text-primary-700 font-semibold mb-1">مدة الخدمة</div>
                <div className="text-2xl font-black text-primary-800">{result.years} سنة و {result.months} شهر</div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "الراتب النسبي عن الشهر الأخير", value: result.prorated_salary, color: "text-slate-800" },
                  { label: "قيمة الإجازات المستحقة", value: result.leave_value, color: "text-slate-800" },
                  { label: "مكافأة نهاية الخدمة (قانون العمل)", value: result.eos_bonus, color: "text-primary-700" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`font-mono font-bold ${item.color}`} dir="ltr">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t-2 border-primary-200 bg-primary-50 px-4 py-3 rounded-xl mt-2">
                  <span className="font-bold text-slate-800 text-lg">الإجمالي المستحق</span>
                  <span className="font-mono font-black text-2xl text-primary-700" dir="ltr">{fmt(result.total)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                {journalCreated ? (
                   <div className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-2 rounded-xl text-sm flex items-center justify-center border border-emerald-200">
                     تم إنشاء القيد المحاسبي بنجاح!
                   </div>
                ) : (
                  <button onClick={handleCreateJournal} disabled={isProcessingJournal} className="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50">
                    {isProcessingJournal ? <><RefreshCw className="w-4 h-4 animate-spin"/> جاري الإنشاء...</> : 'إنشاء قيد محاسبي'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <Calculator className="w-16 h-16 opacity-20" />
              <p className="text-sm">أدخل بيانات الموظف وانقر "احتساب المستحقات" لرؤية النتيجة.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
