import { useState } from "react";
import { 
  Banknote, Globe, TrendingUp, TrendingDown, History, 
  RefreshCcw, Calculator, ArrowRightLeft, Building2,
  FileText, CheckCircle2, AlertCircle, LineChart
} from "lucide-react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";

export function MultiCurrencyPage() {
  const [activeTab, setActiveTab] = useState<'rates' | 'revaluation' | 'realized'>('rates');
  const navigate = useNavigate();
  
  const [currentRates, setCurrentRates] = useState([
    { currency: 'USD', name: 'دولار أمريكي', rate: '47.50', inverse: '0.02105', source: 'البنك المركزي المصري', change: '+0.15', trend: 'up' },
    { currency: 'EUR', name: 'يورو', rate: '51.20', inverse: '0.01953', source: 'البنك المركزي المصري', change: '-0.05', trend: 'down' },
    { currency: 'GBP', name: 'جنيه إسترليني', rate: '60.10', inverse: '0.01663', source: 'سوق حر', change: '+0.30', trend: 'up' },
    { currency: 'SAR', name: 'ريال سعودي', rate: '12.66', inverse: '0.07898', source: 'البنك المركزي المصري', change: '0.00', trend: 'flat' },
  ]);

  const [unrealizedData, setUnrealizedData] = useState([
    { id: 1, account: 'حساب بنكي: CIB - USD', type: 'أصل', foreignBalance: '$45,000.00', bookRate: 47.00, currentRate: 47.50, bookValue: 2115000, newValue: 2137500, gain: 22500 },
    { id: 2, account: 'مورد: Global Tech (EUR)', type: 'خصم', foreignBalance: '€12,500.00', bookRate: 51.50, currentRate: 51.20, bookValue: 643750, newValue: 640000, gain: 3750 },
    { id: 3, account: 'عميل: Arab Emirates Co (SAR)', type: 'أصل', foreignBalance: 'SAR 150,000.00', bookRate: 12.75, currentRate: 12.66, bookValue: 1912500, newValue: 1899000, gain: -13500 },
  ]);

  const [realizedData, setRealizedData] = useState([
    { id: 'GL-2026-001', date: '2026-06-15', transaction: 'سداد فاتورة مورد (Global Tech)', foreignAmount: '€5,000.00', invoiceRate: 51.00, paymentRate: 51.20, gainLoss: -1000 },
    { id: 'GL-2026-002', date: '2026-06-10', transaction: 'تحصيل فاتورة مبيعات (TechCorp)', foreignAmount: '$10,000.00', invoiceRate: 47.20, paymentRate: 47.50, gainLoss: 3000 },
    { id: 'GL-2026-003', date: '2026-05-28', transaction: 'تحويل بين حسابات بنكية (EGP to USD)', foreignAmount: '$2,000.00', invoiceRate: 47.50, paymentRate: 47.80, gainLoss: -600 },
  ]);

  const handleUpdateRates = () => {
    setCurrentRates(prev => prev.map(rate => {
      const isUp = Math.random() > 0.5;
      const changeVal = (Math.random() * 0.5).toFixed(2);
      const newRate = isUp 
        ? (Number(rate.rate) + Number(changeVal)).toFixed(2)
        : (Number(rate.rate) - Number(changeVal)).toFixed(2);
      
      const newInverse = (1 / Number(newRate)).toFixed(5);
        
      return {
        ...rate,
        rate: newRate,
        inverse: newInverse,
        change: `${isUp ? '+' : '-'}${changeVal}`,
        trend: isUp ? 'up' : 'down'
      };
    }));
    toast.success("تم تحديث أسعار الصرف بنجاح");
  };

  const handleRunRevaluation = () => {
    toast.success("تم إنشاء قيد إعادة تقييم الأرصدة بنجاح وتوجيه الفروق لـ (أرباح/خسائر غير محققة)");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2">
            <Globe className="w-7 h-7 text-primary-600"/> تعدد العملات (Multi-Currency)
          </h2>
          <p className="text-slate-500 mt-1">
            العملة الأساسية للنظام: <strong className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded">EGP (الجنيه المصري)</strong>. 
            تحديث وإدارة أسعار الصرف وإعادة تقييم الأرصدة المفتوحة.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
           <button
              onClick={() => setActiveTab('rates')}
              className={clsx(
                 "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap",
                 activeTab === 'rates' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <RefreshCcw className="w-4 h-4"/> أسعار الصرف
           </button>
           <button
              onClick={() => setActiveTab('revaluation')}
              className={clsx(
                 "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap",
                 activeTab === 'revaluation' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <LineChart className="w-4 h-4"/> إعادة التقييم (Unrealized)
           </button>
           <button
              onClick={() => setActiveTab('realized')}
              className={clsx(
                 "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition whitespace-nowrap",
                 activeTab === 'realized' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <ArrowRightLeft className="w-4 h-4"/> الأرباح المحققة (Realized)
           </button>
        </div>
      </div>

      {/* Rates Tab */}
      {activeTab === 'rates' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentRates.map(rate => (
              <div key={rate.currency} className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl">{rate.currency}</h3>
                    <p className="text-slate-500 text-sm font-medium">{rate.name}</p>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-primary-600 group-hover:bg-primary-50 transition-colors">
                    <Banknote className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-3xl font-black text-slate-800">{rate.rate}</span>
                  <span className="text-slate-500 mb-1 font-bold text-sm">EGP</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100/80 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>مقلوب السعر (Inverse)</span>
                    <span className="font-mono font-bold bg-slate-50 px-2 py-0.5 rounded">{rate.inverse}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>المصدر</span>
                    <span className="font-bold">{rate.source}</span>
                  </div>
                  <div className={clsx(
                    "flex items-center gap-1 text-xs font-bold pt-1",
                    rate.trend === 'up' ? "text-primary-600" : rate.trend === 'down' ? "text-rose-600" : "text-slate-500"
                  )}>
                    {rate.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : rate.trend === 'down' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    {rate.change} منذ التحديث الأخير
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex flex-wrap justify-end gap-4 mt-2">
             <button onClick={() => navigate('/journal/new')} className="bg-white border border-slate-200 shadow-sm text-slate-700 font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition">
                <FileText className="w-4 h-4" /> السجل التاريخي
             </button>
             <button onClick={handleUpdateRates} className="bg-primary-600 shadow-sm text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition">
                <RefreshCcw className="w-4 h-4" /> تحديث الأسعار (Fetch Rates)
             </button>
          </div>
        </div>
      )}

      {/* Unrealized Revaluation Tab */}
      {activeTab === 'revaluation' && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary-600" />
                إعادة تقييم الأرصدة المفتوحة (Unrealized Revaluation)
              </h3>
              <p className="text-slate-500 text-sm mt-1">تحديث قيمة الأصول والخصوم بالعملات الأجنبية بناءً على سعر صرف اليوم وإثبات الفروق كأرباح/خسائر غير محققة.</p>
            </div>
            <button onClick={handleRunRevaluation} className="bg-primary-600 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition shadow-sm whitespace-nowrap">
              <Calculator className="w-4 h-4" /> إنشاء قيد التقييم الشهري
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">الحساب / الطرف</th>
                  <th className="px-6 py-4 text-start">النوع</th>
                  <th className="px-6 py-4 text-start">الرصيد الأجنبي</th>
                  <th className="px-6 py-4 text-start">السعر الدفتري</th>
                  <th className="px-6 py-4 text-start">السعر الحالي</th>
                  <th className="px-6 py-4 text-start">القيمة الدفترية (EGP)</th>
                  <th className="px-6 py-4 text-start">القيمة الحالية (EGP)</th>
                  <th className="px-6 py-4 text-start">الربح / الخسارة غير المحققة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unrealizedData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                      {row.type === 'أصل' ? <Building2 className="w-4 h-4 text-slate-400" /> : <FileText className="w-4 h-4 text-slate-400" />}
                      {row.account}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("px-2 py-1 rounded text-xs font-bold", row.type === 'أصل' ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600")}>
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700" dir="ltr">{row.foreignBalance}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{row.bookRate.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{row.currentRate.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-slate-600" dir="ltr">{row.bookValue.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900" dir="ltr">{row.newValue.toLocaleString()}</td>
                    <td className="px-6 py-4" dir="ltr">
                      <span className={clsx(
                        "font-bold font-mono px-2.5 py-1 rounded-lg flex items-center justify-end gap-1 max-w-[fit-content]",
                        row.gain > 0 ? "bg-primary-50 text-primary-700" : "bg-rose-50 text-rose-700"
                      )}>
                        {row.gain > 0 ? '+' : ''}{row.gain.toLocaleString()} EGP
                        {row.gain > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Realized Gains Tab */}
      {activeTab === 'realized' && (
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-primary-600" />
                سجل الأرباح والخسائر المحققة (Realized Gains/Losses)
              </h3>
              <p className="text-slate-500 text-sm mt-1">الفروق الناتجة عن تسويات فعلية (سداد فواتير، تحويل بنكي) بين سعر الصرف وقت التسجيل وسعر الصرف وقت السداد.</p>
            </div>
            <button onClick={() => navigate('/journal')} className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition shadow-sm">
              <FileText className="w-4 h-4" /> عرض القيود المحاسبية
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50/50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">تاريخ العملية</th>
                  <th className="px-6 py-4 text-start">البيان</th>
                  <th className="px-6 py-4 text-start">المبلغ المسدد</th>
                  <th className="px-6 py-4 text-start">سعر الفاتورة (الأصلي)</th>
                  <th className="px-6 py-4 text-start">سعر السداد (الفعلي)</th>
                  <th className="px-6 py-4 text-start">الفرق المحقق</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {realizedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{row.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.transaction}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-700" dir="ltr">{row.foreignAmount}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{row.invoiceRate.toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{row.paymentRate.toFixed(2)}</td>
                    <td className="px-6 py-4" dir="ltr">
                      <span className={clsx(
                        "font-bold font-mono flex items-center justify-end gap-1",
                        row.gainLoss > 0 ? "text-primary-600" : "text-rose-600"
                      )}>
                        {row.gainLoss > 0 ? '+' : ''}{row.gainLoss.toLocaleString()} EGP
                        {row.gainLoss > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
