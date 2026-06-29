import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { type Employee } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Users, Plus, ShieldCheck, FileText, Briefcase, Calculator } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setEmployees(data.data))
      .catch(() => {
        const localEmployees = JSON.parse(localStorage.getItem(getCompanyKey('mock_employees')) || '[]');
        if (localEmployees.length > 0) {
          setEmployees(localEmployees);
        } else if (false) {
            const defaults = [
            { id: 1, name: 'أحمد محمد علي', employee_code: 'EMP-001', department: 'الهندسة (Engineering)', position: 'مهندس برمجيات', join_date: '2023-01-15', basic_salary: 15000, allowances: 2000, status: 'active' },
            { id: 2, name: 'سارة أحمد السيد', employee_code: 'EMP-002', department: 'التسويق (Marketing)', position: 'مدير تسويق', join_date: '2022-05-10', basic_salary: 20000, allowances: 3000, status: 'active' }
          ];
          localStorage.setItem(getCompanyKey('mock_employees'), JSON.stringify(defaults));
          setEmployees(defaults);
        }
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">الموظفين (Employees)</h2>
          <p className="text-slate-500 mt-1">إدارة بيانات الموظفين، الرواتب، والبدلات.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => navigate('/employees/new')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> إضافة موظف
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الكود / الاسم</th>
                <th className="px-6 py-4 text-start">القسم والوظيفة</th>
                <th className="px-6 py-4 text-start">تاريخ التعيين</th>
                <th className="px-6 py-4 text-end">الراتب الأساسي (EGP)</th>
                <th className="px-6 py-4 text-end">البدلات (EGP)</th>
                <th className="px-6 py-4 text-start">الحالة</th>
                <th className="px-6 py-4 text-end">عناصر إضافية</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{emp.employee_code}</div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="text-slate-800 font-medium">{emp.department}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{emp.position}</div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    {format(new Date(emp.join_date), 'yyyy/MM/dd')}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(emp.basic_salary)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-primary-600" dir="ltr">
                    +{new Intl.NumberFormat('ar-EG').format(emp.allowances)}
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                      {emp.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end flex items-center justify-end gap-1">
                     <button onClick={() => navigate('/employees/advances')} title="سلف وقروض" className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Calculator className="w-4 h-4" /></button>
                     <button onClick={() => navigate('/employees/insurances')} title="إدارة التأمينات" className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><ShieldCheck className="w-4 h-4" /></button>
                     <button onClick={() => navigate('/employees/end-of-service')} title="نهاية الخدمة / ملف الموظف" className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition"><FileText className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
