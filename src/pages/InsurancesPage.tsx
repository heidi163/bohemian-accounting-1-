import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowRight, ShieldCheck, Plus, Search, Filter } from "lucide-react";

export function InsurancesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const insurances = [
    { id: 1, empName: 'أحمد محمد علي', type: 'تأمين طبي', policyNo: 'MED-100293', premium: 500, status: 'active', startDate: '2023-01-15' },
    { id: 2, empName: 'سارة أحمد السيد', type: 'تأمين اجتماعي', policyNo: 'SOC-992834', premium: 1200, status: 'active', startDate: '2022-05-10' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/employees')} className="text-slate-400 hover:text-slate-600 transition">
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary-600" />
              <h2 className="font-bold text-slate-800 text-2xl">إدارة التأمينات</h2>
            </div>
            <p className="text-slate-500 mt-1">متابعة التأمين الطبي والاجتماعي للموظفين.</p>
          </div>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> إضافة بوليصة تأمين
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="بحث باسم الموظف أو رقم البوليصة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pr-10 pl-4 py-2 focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" /> تصفية
          </button>
        </div>
        
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">اسم الموظف</th>
                <th className="px-6 py-4 text-start">نوع التأمين</th>
                <th className="px-6 py-4 text-start">رقم البوليصة</th>
                <th className="px-6 py-4 text-start">تاريخ البدء</th>
                <th className="px-6 py-4 text-end">القسط الشهري</th>
                <th className="px-6 py-4 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {insurances.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-start font-bold text-slate-900">{item.empName}</td>
                  <td className="px-6 py-4 text-start text-slate-800 font-medium">{item.type}</td>
                  <td className="px-6 py-4 text-start text-slate-500 font-mono">{item.policyNo}</td>
                  <td className="px-6 py-4 text-start">{item.startDate}</td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(item.premium)} EGP
                  </td>
                  <td className="px-6 py-4 text-start">
                    <span className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none bg-primary-100 text-primary-700">
                      نشط
                    </span>
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
