import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, Save, UserPlus } from "lucide-react";
import { getCompanyKey } from '../utils/storage';

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    position: '',
    basic_salary: 0,
    allowances: 0,
    join_date: new Date().toISOString().split('T')[0]
  });

  const handleSave = async () => {
    if (!formData.name || !formData.department || !formData.position || formData.basic_salary <= 0) {
      alert('الرجاء إدخال جميع البيانات الأساسية والراتب بشكل صحيح');
      return;
    }

    const localEmployees = JSON.parse(localStorage.getItem(getCompanyKey('mock_employees')) || '[]');
    if (localEmployees.length === 0) {
      localEmployees.push(
        { id: 1, name: 'أحمد محمد علي', employee_code: 'EMP-001', department: 'الهندسة (Engineering)', position: 'مهندس برمجيات', join_date: '2023-01-15', basic_salary: 15000, allowances: 2000, status: 'active' },
        { id: 2, name: 'سارة أحمد السيد', employee_code: 'EMP-002', department: 'التسويق (Marketing)', position: 'مدير تسويق', join_date: '2022-05-10', basic_salary: 20000, allowances: 3000, status: 'active' }
      );
    }
    const newEmployee = {
      ...formData,
      id: Date.now(),
      employee_code: `EMP-${String(localEmployees.length + 1).padStart(3, '0')}`,
      status: 'active'
    };
    localEmployees.push(newEmployee);
    localStorage.setItem(getCompanyKey('mock_employees'), JSON.stringify(localEmployees));
    
    alert('تمت إضافة الموظف بنجاح!');
    navigate('/employees');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden max-w-3xl mx-auto">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-4 ">
          <button onClick={() => navigate('/employees')} className="text-slate-400 hover:text-slate-600 transition">
            <ArrowRight className="w-6 h-6 " />
          </button>
          <div className="flex items-center gap-2 text-slate-800">
            <UserPlus className="w-6 h-6 text-primary-600" />
            <h2 className="font-bold text-lg">إضافة موظف جديد</h2>
          </div>
        </div>
        <button 
          onClick={handleSave}
          className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> حفظ الموظف
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">الاسم الرباعي</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              placeholder="مثال: أحمد محمد علي" 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ التعيين</label>
            <input 
              type="date" 
              value={formData.join_date} 
              onChange={e => setFormData({...formData, join_date: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">القسم</label>
            <select 
              value={formData.department} 
              onChange={e => setFormData({...formData, department: e.target.value})} 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            >
              <option value="" disabled>اختر القسم...</option>
              <option value="Engineering">الهندسة (Engineering)</option>
              <option value="Sales">المبيعات (Sales)</option>
              <option value="Marketing">التسويق (Marketing)</option>
              <option value="HR">الموارد البشرية (HR)</option>
              <option value="Finance">المالية (Finance)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">المسمى الوظيفي</label>
            <input 
              type="text" 
              value={formData.position} 
              onChange={e => setFormData({...formData, position: e.target.value})} 
              placeholder="مثال: مهندس برمجيات" 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
            />
          </div>
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
            <label className="block text-sm font-medium text-slate-700 mb-2">الراتب الأساسي (EGP)</label>
            <input 
              type="number" 
              value={formData.basic_salary || ''} 
              onChange={e => setFormData({...formData, basic_salary: Number(e.target.value)})} 
              placeholder="0.00" 
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-start" 
              dir="ltr"
            />
          </div>
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
            <label className="block text-sm font-medium text-slate-700 mb-2">بدلات ثابتة (EGP)</label>
            <input 
              type="number" 
              value={formData.allowances || ''} 
              onChange={e => setFormData({...formData, allowances: Number(e.target.value)})} 
              placeholder="0.00" 
              className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-start" 
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
