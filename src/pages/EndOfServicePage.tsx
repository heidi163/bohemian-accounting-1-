import { useState, useEffect } from "react";
import { Calculator, User, Calendar, DollarSign, FileDown, RefreshCw, FileText, CheckCircle2 } from "lucide-react";
import { type Employee } from "../types";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

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
    const activeCompany = getActiveCompany();
    fetch("/api/employees")
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
         const emps = data.data || [];
         setEmployees(emps.filter((e: any) => e.company_id === activeCompany || !e.company_id));
      })
      .catch(() => {
        const localEmployees = JSON.parse(localStorage.getItem(getCompanyKey('mock_employees')) || '[]');
        if (localEmployees.length > 0) {
          setEmployees(localEmployees.filter((e: any) => e.company_id === activeCompany || !e.company_id));
        }
      });
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
    
    setTimeout(() => {
      const activeCompany = getActiveCompany();
      const localJournals = JSON.parse(localStorage.getItem(getCompanyKey('mock_journals')) || '[]');
      const emp = employees.find(e => e.id.toString() === form.employee_id);
      const empName = emp ? emp.name : '';
      
      const newJournal = {
        id: Date.now().toString(),
        entry_number: `JE-EOS-${Date.now().toString().slice(-4)}`,
        entry_date: new Date().toISOString().split('T')[0],
        description: `إثبات مستحقات نهاية الخدمة للموظف ${empName}`,
        total_debit: result.total,
        total_credit: result.total,
        status: 'draft',
        company_id: activeCompany
      };
      
      localJournals.push(newJournal);
      localStorage.setItem(getCompanyKey('mock_journals'), JSON.stringify(localJournals));
      
      setJournalCreated(true);
      setIsProcessingJournal(false);
    }, 1000);
  };

  const fmt = (n: number) => new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(n);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 bg-primary-100 text-primary-700 rounded-3xl mb-4">
             <Calculator className="w-8 h-8" />
          </div>
          <h2 className="font-black text-slate-800 text-3xl mb-2">
            حاسبة نهاية الخدمة (End of Service)
          </h2>
          <p className="text-slate-500 font-medium max-w-lg">احتساب مستحقات الموظف وفق قانون العمل المصري بشكل دقيق وآلي، مع إمكانية إصدار القيد المحاسبي فوراً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-8 space-y-6 relative overflow-hidden">
          <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 border-b border-slate-100 pb-4">
            <User className="w-5 h-5 text-primary-600" />
            بيانات الموظف
          </h3>

          {errorMsg && (
            <div className="bg-rose-50 text-rose-700 p-4 rounded-2xl text-sm font-bold border border-rose-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              {errorMsg}
            </div>
          )}

          <div className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">الموظف</label>
              <select value={form.employee_id} onChange={e => handleEmployeeChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm">
                <option value="">اختر الموظف...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> تاريخ التعيين</label>
                <input type="date" value={form.hire_date} onChange={e => setForm({ ...form, hire_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> تاريخ المغادرة</label>
                <input type="date" value={form.exit_date} onChange={e => setForm({ ...form, exit_date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1"><DollarSign className="w-4 h-4 text-slate-400" /> الراتب الأساسي (EGP)</label>
              <input type="number" value={form.basic_salary} onChange={e => setForm({ ...form, basic_salary: e.target.value })} placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">رصيد الإجازات المتبقية (أيام)</label>
              <input type="number" value={form.leave_balance} onChange={e => setForm({ ...form, leave_balance: e.target.value })} placeholder="0" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm" dir="ltr" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">سبب المغادرة</label>
              <select value={form.exit_reason} onChange={e => setForm({ ...form, exit_reason: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-500 transition-colors shadow-sm">
                <option value="resignation">استقالة (Resignation)</option>
                <option value="termination">إنهاء خدمة (Termination)</option>
                <option value="retirement">تقاعد (Retirement)</option>
              </select>
            </div>

            <button onClick={calculate} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 hover:-translate-y-0.5 shadow-lg shadow-primary-600/20 transition-all flex items-center justify-center gap-2 mt-4">
              <Calculator className="w-5 h-5" /> احتساب المستحقات
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-8 flex flex-col relative overflow-hidden">
          <h3 className="font-bold text-slate-800 text-xl flex items-center gap-2 border-b border-slate-100 pb-4 mb-6 relative z-10">
            <FileText className="w-5 h-5 text-primary-600" />
            نتيجة الاحتساب
          </h3>
          
          {result ? (
            <div className="space-y-6 flex-1 relative z-10 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-3xl p-6 text-center shadow-sm">
                <div className="text-sm text-primary-600 font-bold mb-2">مدة الخدمة الفعلية</div>
                <div className="text-3xl font-black text-slate-800">{result.years} سنة <span className="text-primary-600">و</span> {result.months} شهر</div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-4">
                {[
                  { label: "الراتب النسبي عن الشهر الأخير", value: result.prorated_salary, color: "text-slate-800" },
                  { label: "قيمة الإجازات المستحقة", value: result.leave_value, color: "text-slate-800" },
                  { label: "مكافأة نهاية الخدمة (قانون العمل)", value: result.eos_bonus, color: "text-primary-600" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center pb-4 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                    <span className={`font-mono font-bold text-lg ${item.color}`} dir="ltr">{fmt(item.value)}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center bg-slate-900 text-white px-6 py-5 rounded-2xl shadow-lg">
                <span className="font-bold text-lg">الإجمالي المستحق</span>
                <span className="font-mono font-black text-2xl text-emerald-400" dir="ltr">{fmt(result.total)}</span>
              </div>

              <div className="flex gap-3 mt-4">
                {journalCreated ? (
                   <div className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 border border-emerald-200 animate-in zoom-in-95">
                     <CheckCircle2 className="w-5 h-5" />
                     تم إنشاء القيد المحاسبي بنجاح!
                   </div>
                ) : (
                  <button onClick={handleCreateJournal} disabled={isProcessingJournal} className="flex-1 bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                    {isProcessingJournal ? <><RefreshCw className="w-5 h-5 animate-spin"/> جاري الإنشاء...</> : 'تأكيد وإنشاء قيد محاسبي'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 space-y-4">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                 <Calculator className="w-12 h-12 text-slate-300" />
              </div>
              <p className="text-sm font-medium max-w-xs">أدخل بيانات الموظف وانقر "احتساب المستحقات" لرؤية النتيجة هنا.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
