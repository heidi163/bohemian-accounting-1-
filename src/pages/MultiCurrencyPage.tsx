import { useState } from "react";
import { 
  Banknote, Globe, TrendingUp, TrendingDown, History, 
  RefreshCcw, Calculator, ArrowRightLeft 
} from "lucide-react";
import { clsx } from "clsx";
import { useNavigate } from "react-router";

export function MultiCurrencyPage() {
  const [activeTab, setActiveTab] = useState<'rates' | 'history' | 'gains'>('rates');
  
  const navigate = useNavigate();
  
  const [currentRates, setCurrentRates] = useState([
    { currency: 'USD', name: 'دولار أمريكي', rate: '47.50', change: '+0.15', trend: 'up' },
    { currency: 'EUR', name: 'يورو', rate: '51.20', change: '-0.05', trend: 'down' },
    { currency: 'GBP', name: 'جنيه إسترليني', rate: '60.10', change: '+0.30', trend: 'up' },
  ]);

  const historicalRates = [
    { date: '2026-06-15', usd: '47.35', eur: '51.25', gbp: '59.80' },
    { date: '2026-06-14', usd: '47.40', eur: '51.10', gbp: '59.90' },
    { date: '2026-06-13', usd: '47.30', eur: '51.00', gbp: '59.75' },
    { date: '2026-06-12', usd: '47.50', eur: '51.30', gbp: '60.00' },
  ];

  const [gainLossEntries, setGainLossEntries] = useState([
    { id: 'GL-1001', date: '2026-06-16', account: 'بنك CIB (دولار)', amount: '$10,000', type: 'تقييم شهري', gainLoss: '+1,500 EGP', status: 'مُرحل' },
    { id: 'GL-1002', date: '2026-06-10', account: 'مورد (Global Tech)', amount: '$5,000', type: 'سداد فاتورة', gainLoss: '-250 EGP', status: 'مُرحل' },
    { id: 'GL-1003', date: '2026-05-31', account: 'بنك QNB (يورو)', amount: '€8,000', type: 'تقييم شهري', gainLoss: '+800 EGP', status: 'مُرحل' },
  ]);

  const handleUpdateRates = () => {
    setCurrentRates(prev => prev.map(rate => {
      const isUp = Math.random() > 0.5;
      const changeVal = (Math.random() * 0.5).toFixed(2);
      const newRate = isUp 
        ? (Number(rate.rate) + Number(changeVal)).toFixed(2)
        : (Number(rate.rate) - Number(changeVal)).toFixed(2);
        
      return {
        ...rate,
        rate: newRate,
        change: `${isUp ? '+' : '-'}${changeVal}`,
        trend: isUp ? 'up' : 'down'
      };
    }));
  };

  const handleCalculateGains = () => {
    const newEntry = { 
      id: `GL-${1000 + gainLossEntries.length + 1}`, 
      date: new Date().toISOString().split('T')[0], 
      account: 'إعادة تقييم الأرصدة', 
      amount: '-', 
      type: 'تقييم دوري', 
      gainLoss: '+2,300 EGP', 
      status: 'مسودة' 
    };
    setGainLossEntries([newEntry, ...gainLossEntries]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><Globe className="w-7 h-7 text-primary-600"/> تعدد العملات (Multi-Currency)</h2>
          <p className="text-slate-500 mt-1">العملة الأساسية للنظام: <strong className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded">EGP (الجنيه المصري)</strong>. يدعم <strong className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">USD</strong> وعملات أخرى.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
              onClick={() => setActiveTab('rates')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'rates' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <RefreshCcw className="w-4 h-4"/> أسعار الصرف
           </button>
           <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'history' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <History className="w-4 h-4"/> الأسعار التاريخية
           </button>
           <button
              onClick={() => setActiveTab('gains')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'gains' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <ArrowRightLeft className="w-4 h-4"/> فروق العملة
           </button>
        </div>
      </div>

      {activeTab === 'rates' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentRates.map(rate => (
            <div key={rate.currency} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{rate.currency}</h3>
                  <p className="text-slate-500 text-sm">{rate.name}</p>
                </div>
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 font-bold">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-800">{rate.rate}</span>
                <span className="text-slate-500 mb-1 font-bold text-sm">EGP</span>
              </div>
              <div className={clsx(
                "mt-4 text-sm font-bold flex items-center gap-1",
                rate.trend === 'up' ? "text-emerald-600" : "text-rose-600"
              )}>
                {rate.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {rate.change} منذ التحديث الأخير
              </div>
            </div>
          ))}
          
          <div className="md:col-span-3 flex justify-end gap-4 mt-2">
             <button onClick={handleUpdateRates} className="bg-white border border-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl flex items-center gap-2 hover:bg-slate-50 transition">
                <RefreshCcw className="w-4 h-4" /> تحديث الأسعار يدوياً
             </button>
             <button onClick={() => navigate('/journal/new')} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition">
                <Calculator className="w-4 h-4" /> قيد يومية بعملة أجنبية
             </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">الأسعار التاريخية (Historical Rates)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">التاريخ</th>
                  <th className="px-6 py-4 text-start">USD (دولار)</th>
                  <th className="px-6 py-4 text-start">EUR (يورو)</th>
                  <th className="px-6 py-4 text-start">GBP (إسترليني)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historicalRates.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-slate-500">{row.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.usd} EGP</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.eur} EGP</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{row.gbp} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gains' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">أرباح وخسائر فروق العملة (Currency Gain/Loss)</h3>
            <button onClick={handleCalculateGains} className="bg-emerald-50 text-emerald-600 font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-emerald-100 transition text-sm">
              <Calculator className="w-4 h-4" /> حساب التقييم الشهري
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-start">رقم القيد</th>
                  <th className="px-6 py-4 text-start">التاريخ</th>
                  <th className="px-6 py-4 text-start">الحساب</th>
                  <th className="px-6 py-4 text-start">المبلغ (أجنبي)</th>
                  <th className="px-6 py-4 text-start">النوع</th>
                  <th className="px-6 py-4 text-start">الربح / الخسارة</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gainLossEntries.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-primary-600">{entry.id}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{entry.date}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{entry.account}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{entry.amount}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{entry.type}</span></td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "font-bold font-mono text-sm",
                        entry.gainLoss.startsWith('+') ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {entry.gainLoss}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded text-xs font-bold">{entry.status}</span>
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
