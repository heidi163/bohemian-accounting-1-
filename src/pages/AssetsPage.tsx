import { useEffect, useState } from "react";
import { type Asset } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Monitor, Car, Briefcase, Armchair, Plus, RefreshCcw, DollarSign, Trash2, X, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { getCompanyKey } from '../utils/storage';

const categoryIcons: Record<string, React.ReactNode> = {
  computers: <Monitor className="w-4 h-4" />,
  cars: <Car className="w-4 h-4" />,
  equipment: <Briefcase className="w-4 h-4" />,
  furniture: <Armchair className="w-4 h-4" />,
};

const categoryTranslations: Record<string, string> = {
  computers: 'أجهزة حاسب',
  cars: 'سيارات ومركبات',
  equipment: 'معدات وآلات',
  furniture: 'أثاث ومفروشات',
};

const methodTranslations: Record<string, string> = {
  straight_line: 'قسط ثابت (Straight Line)',
  declining_balance: 'رصيد متناقص (Declining Balance)',
};

export function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [activeModal, setActiveModal] = useState<null | 'dispose'>(null);
  const [focusedAsset, setFocusedAsset] = useState<Asset | null>(null);
  const [disposeType, setDisposeType] = useState<'sell' | 'scrap'>('sell');
  const [disposeAmount, setDisposeAmount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/assets")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => setAssets(data.data))
      .catch(() => {
        const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
        if (localAssets.length > 0) {
          setAssets(localAssets);
        } else {
          const defaults = [
            { id: "1", asset_code: "AST-2026-001", name: "سيرفرات ديل (Dell Servers)", category: "computers", purchase_price: 120000, net_book_value: 90000, accumulated_depreciation: 30000, status: "active", useful_life_years: 4, depreciation_method: "straight_line" },
            { id: "2", asset_code: "AST-2026-002", name: "سيارة نقل مرسيدس", category: "cars", purchase_price: 850000, net_book_value: 850000, accumulated_depreciation: 0, status: "active", useful_life_years: 5, depreciation_method: "straight_line" }
          ];
          localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(defaults));
          setAssets(defaults);
        }
      });
  }, []);

  const openDispose = (asset: Asset) => {
    setFocusedAsset(asset);
    setDisposeAmount(asset.net_book_value);
    setActiveModal('dispose');
  };

  const [isDepreciating, setIsDepreciating] = useState(false);

  const handleRunDepreciation = async () => {
    setIsDepreciating(true);
    setTimeout(() => {
      const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
      const updatedAssets = localAssets.map((asset: any) => {
        if (asset.status !== 'active' || asset.net_book_value <= (asset.salvage_value || 0)) return asset;
        
        let depAmount = 0;
        if (asset.depreciation_method === 'straight_line') {
          depAmount = (asset.purchase_price - (asset.salvage_value || 0)) / (asset.useful_life_years * 12);
        } else {
          depAmount = asset.net_book_value * 0.02; // simplified declining balance for mock
        }
        
        const newAccumulated = asset.accumulated_depreciation + depAmount;
        const newNetBook = asset.purchase_price - newAccumulated;
        
        return {
          ...asset,
          accumulated_depreciation: newAccumulated,
          net_book_value: Math.max(newNetBook, asset.salvage_value || 0)
        };
      });
      localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(updatedAssets));
      setAssets(updatedAssets);
      setIsDepreciating(false);
    }, 1000);
  };

  const calculateGainLoss = () => {
    if (!focusedAsset) return 0;
    if (disposeType === 'scrap') return -focusedAsset.net_book_value;
    return disposeAmount - focusedAsset.net_book_value;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl">الأصول الثابتة (Fixed Assets)</h2>
          <p className="text-slate-500 mt-1">سجل الأصول، الإهلاك، والاستبعادات.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRunDepreciation} disabled={isDepreciating} className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50">
            <RefreshCcw className={clsx("w-4 h-4", isDepreciating && "animate-spin")} /> {isDepreciating ? "جاري الإهلاك..." : "تنفيذ الإهلاك الشهري"}
          </button>
          <button onClick={() => navigate('/assets/new')} className="bg-primary-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> تسجيل أصل جديد
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">إجمالي تكلفة الأصول (Purchase Value)</div>
           <div className="text-2xl font-black text-slate-800 font-mono" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(assets.reduce((sum, a) => sum + a.purchase_price, 0))}
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="text-sm font-semibold text-slate-500 mb-1">مجمع الإهلاك (Accumulated Dep.)</div>
           <div className="text-2xl font-black text-rose-600 font-mono" dir="ltr">
             -{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(assets.reduce((sum, a) => sum + a.accumulated_depreciation, 0))}
           </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-b-4 border-b-emerald-500">
           <div className="text-sm font-semibold text-slate-500 mb-1">صافي القيمة الدفترية (Net Book Value)</div>
           <div className="text-2xl font-black text-emerald-600 font-mono" dir="ltr">
             {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(assets.reduce((sum, a) => sum + a.net_book_value, 0))}
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest">
              <tr className="border-b border-slate-100">
                <th className="px-6 py-4 text-start">الأصل (Asset Register)</th>
                <th className="px-6 py-4 text-start">طريقة الإهلاك</th>
                <th className="px-6 py-4 text-end">التكلفة</th>
                <th className="px-6 py-4 text-end">مجمع الإهلاك</th>
                <th className="px-6 py-4 text-end">القيمة الدفترية</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-end">التصرف (Disposal)</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        {categoryIcons[asset.category] || <Briefcase className="w-4 h-4"/>}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{asset.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{asset.asset_code} &bull; {categoryTranslations[asset.category] || asset.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="font-medium text-slate-800">{methodTranslations[asset.depreciation_method] || asset.depreciation_method}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{asset.useful_life_years} سنوات (عمر إنتاجي)</div>
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-slate-900" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(asset.purchase_price)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-medium text-rose-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(asset.accumulated_depreciation)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-emerald-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(asset.net_book_value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx('inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold leading-none', asset.status === 'active' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-700')}>
                      {asset.status === 'active' ? 'نشط' : asset.status === 'sold' ? 'مباع' : 'مهلك'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end whitespace-nowrap">
                     {asset.status === 'active' ? (
                        <button onClick={() => openDispose(asset)} className="text-rose-600 font-semibold text-xs hover:underline bg-rose-50 px-2 py-1.5 rounded-lg flex justify-end gap-1 items-center ms-auto">
                           <Trash2 className="w-3 h-3" /> استبعاد
                        </button>
                     ) : (
                        <span className="text-xs text-slate-400">تم التصرف</span>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {activeModal === 'dispose' && focusedAsset && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">استبعاد الأصل (Asset Disposal)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800">{focusedAsset.name}</div>
                  <div className="text-sm text-slate-500 mb-2">القيمة الدفترية الحالية: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(focusedAsset.net_book_value)}</div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-2">نوع الاستبعاد</label>
                 <div className="flex gap-2">
                     <button 
                       onClick={() => setDisposeType('sell')} 
                       className={clsx('flex-1 py-2 rounded-lg text-sm font-bold border transition', disposeType === 'sell' ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}
                    >
                       بيع (Sell)
                    </button>
                    <button 
                       onClick={() => setDisposeType('scrap')} 
                       className={clsx('flex-1 py-2 rounded-lg text-sm font-bold border transition', disposeType === 'scrap' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}
                    >
                       تالف / تخريد (Scrap)
                    </button>
                 </div>
               </div>

               {disposeType === 'sell' && (
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">قيمة البيع (Sale Value)</label>
                   <input type="number" value={disposeAmount} onChange={(e) => setDisposeAmount(Number(e.target.value))} className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-lg rounded-xl px-4 py-3 outline-none focus:border-primary-500 text-right" dir="ltr" />
                 </div>
               )}

               <div className={clsx("p-4 rounded-xl border", calculateGainLoss() >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100")}>
                  <div className="text-sm font-bold mb-1">{calculateGainLoss() >= 0 ? "صافي الربح الرأسمالي (Gain)" : "صافي الخسائر الرأسمالية (Loss)"}</div>
                  <div className={clsx("font-mono text-lg font-black", calculateGainLoss() >= 0 ? "text-emerald-700" : "text-rose-700")} dir="ltr">
                     {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(Math.abs(calculateGainLoss()))}
                  </div>
               </div>

              <div className="pt-2">
                 <button 
                   onClick={() => {
                     const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
                     const updatedAssets = localAssets.map((a: any) => a.id === focusedAsset.id ? { ...a, status: disposeType === 'sell' ? 'sold' : 'scrapped' } : a);
                     localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(updatedAssets));
                     setAssets(updatedAssets);
                     setActiveModal(null);
                   }}
                   className="w-full bg-rose-600 text-white font-bold py-3 text-sm rounded-xl hover:bg-rose-700 transition"
                 >
                   تأكيد استبعاد الأصل (Confirm Disposal)
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
