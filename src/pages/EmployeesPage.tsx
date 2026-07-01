import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Employee } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Users, Plus, ShieldCheck, FileText, Briefcase, Calculator, UserCheck, Banknote } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const activeCompany = getActiveCompany();
    const defaults = [
      { id: 1, name: 'أحمد محمد علي', employee_code: 'EMP-001', department: 'الهندسة (Engineering)', position: 'مهندس برمجيات', join_date: '2023-01-15', basic_salary: 15000, allowances: 2000, status: 'active', company_id: 'O2N' },
      { id: 2, name: 'سارة أحمد السيد', employee_code: 'EMP-002', department: 'التسويق (Marketing)', position: 'مدير تسويق', join_date: '2022-05-10', basic_salary: 20000, allowances: 3000, status: 'active', company_id: 'O2N' },
      { id: 3, name: 'محمود عبد السلام', employee_code: 'EMP-003', department: 'المبيعات (Sales)', position: 'مندوب مبيعات', join_date: '2023-11-20', basic_salary: 12000, allowances: 5000, status: 'active', company_id: 'BGK' }
    ];

    const localEmployees = JSON.parse(localStorage.getItem(getCompanyKey('mock_employees')) || '[]');
    
    if (localEmployees.length > 0) {
      setEmployees(localEmployees.filter((e: any) => e.company_id === activeCompany || !e.company_id));
    } else {
      localStorage.setItem(getCompanyKey('mock_employees'), JSON.stringify(defaults));
      setEmployees(defaults.filter((e: any) => e.company_id === activeCompany));
    }
  }, []);

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.basic_salary + e.allowances, 0);

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-3">
            <div className="p-3 bg-primary-100 text-primary-700 rounded-2xl">
               <Users className="w-6 h-6" />
            </div>
            الموارد البشرية (Employees)
          </h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة بيانات الموظفين، هيكل الرواتب، والبدلات.</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <button onClick={() => navigate('/employees/new')} className="bg-primary-600 shadow-lg shadow-primary-600/20 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" /> إضافة موظف
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي الموظفين</p>
              <h3 className="font-black text-slate-800 text-3xl">{totalEmployees}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">على قوة العمل (نشط)</p>
              <h3 className="font-black text-slate-800 text-3xl">{activeEmployees}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي الرواتب والبدلات</p>
              <h3 className="font-black text-slate-800 text-3xl" dir="ltr">{new Intl.NumberFormat('ar-EG').format(totalPayroll)}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">قائمة الموظفين</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-black tracking-wider">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الكود / الاسم</th>
                <th className="px-6 py-4 text-start">القسم والوظيفة</th>
                <th className="px-6 py-4 text-start">تاريخ التعيين</th>
                <th className="px-6 py-4 text-start">الراتب الأساسي (EGP)</th>
                <th className="px-6 py-4 text-start">البدلات (EGP)</th>
                <th className="px-6 py-4 text-start">الحالة</th>
                <th className="px-6 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {employees.length > 0 ? employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-900 text-base">{emp.name}</div>
                    <div className="text-xs text-slate-400 font-mono font-medium mt-0.5">{emp.employee_code}</div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="text-slate-800 font-bold">{emp.department}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.position}</div>
                  </td>
                  <td className="px-6 py-4 text-start text-slate-600 font-mono text-sm">
                    {format(new Date(emp.join_date), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-6 py-4 text-start font-mono font-bold text-slate-800" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(emp.basic_salary)}
                  </td>
                  <td className="px-6 py-4 text-start font-mono font-bold text-primary-600" dir="ltr">
                    +{new Intl.NumberFormat('ar-EG').format(emp.allowances)}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={clsx(
                      'inline-flex items-center rounded-xl px-3 py-1 text-xs font-black', 
                      emp.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    )}>
                      {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-2">
                        <button onClick={() => navigate('/employees/advances')} title="سلف وقروض" className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors">
                           <Calculator className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate('/employees/insurances')} title="إدارة التأمينات" className="p-2.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                           <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate('/employees/end-of-service')} title="ملف الموظف" className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors">
                           <FileText className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">لا يوجد موظفين حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
