import { useEffect, useState } from "react";
import { type Asset } from "../types";
import { clsx } from "clsx";
import { format } from "date-fns";
import { Monitor, Car, Briefcase, Armchair, Plus, RefreshCcw, DollarSign, Trash2, X, Settings, Package, ArrowDownToLine, Wallet } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

const categoryIcons: Record<string, React.ReactNode> = {
  computers: <Monitor className="w-5 h-5" />,
  cars: <Car className="w-5 h-5" />,
  equipment: <Briefcase className="w-5 h-5" />,
  furniture: <Armchair className="w-5 h-5" />,
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
  const [isDepreciating, setIsDepreciating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const activeCompany = getActiveCompany();
    const defaults: Asset[] = [
      { id: 1, asset_code: "AST-2026-001", name: "سيرفرات ديل (Dell Servers)", category: "computers", purchase_date: "2024-01-01", purchase_price: 120000, salvage_value: 0, net_book_value: 90000, accumulated_depreciation: 30000, status: "active", useful_life_years: 4, depreciation_method: "straight_line", company_id: 'O2N' },
      { id: 2, asset_code: "AST-2026-002", name: "سيارة نقل مرسيدس", category: "cars", purchase_date: "2025-05-01", purchase_price: 850000, salvage_value: 50000, net_book_value: 850000, accumulated_depreciation: 0, status: "active", useful_life_years: 5, depreciation_method: "straight_line", company_id: 'O2N' },
      { id: 3, asset_code: "AST-2026-764", name: "أثاث مكتبي الإدارة", category: "furniture", purchase_date: "2023-01-01", purchase_price: 50000, salvage_value: 0, net_book_value: 20000, accumulated_depreciation: 30000, status: "active", useful_life_years: 5, depreciation_method: "straight_line", company_id: 'BGK' }
    ];

    fetch("/api/assets")
      .then((res) => {
        if (!res.ok) throw new Error('API Error');
        return res.json();
      })
      .then((data) => {
         const serverAssets = data.data || [];
         setAssets(serverAssets.filter((a: any) => a.company_id === activeCompany || !a.company_id));
      })
      .catch(() => {
        const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
        if (localAssets.length > 0) {
          setAssets(localAssets.filter((a: any) => a.company_id === activeCompany || !a.company_id));
        } else {
          localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(defaults));
          setAssets(defaults.filter((a: any) => a.company_id === activeCompany));
        }
      });
  }, []);

  const openDispose = (asset: Asset) => {
    setFocusedAsset(asset);
    setDisposeAmount(asset.net_book_value);
    setActiveModal('dispose');
  };

  const handleRunDepreciation = async () => {
    setIsDepreciating(true);
    setTimeout(() => {
      const activeCompany = getActiveCompany();
      const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
      
      let totalDepreciationGenerated = 0;
      let processedAssetsCount = 0;

      const updatedAssets = localAssets.map((asset: any) => {
        // Only process active assets for the current company
        if ((asset.company_id && asset.company_id !== activeCompany) || asset.status !== 'active' || asset.net_book_value <= (asset.salvage_value || 0)) {
          return asset;
        }
        
        let depAmount = 0;
        if (asset.depreciation_method === 'straight_line') {
          // Monthly straight line depreciation
          depAmount = (asset.purchase_price - (asset.salvage_value || 0)) / (asset.useful_life_years * 12);
        } else {
          // Simplified monthly declining balance
          depAmount = asset.net_book_value * 0.02; 
        }
        
        // Ensure we don't depreciate below salvage value
        if (asset.net_book_value - depAmount < (asset.salvage_value || 0)) {
          depAmount = asset.net_book_value - (asset.salvage_value || 0);
        }

        if (depAmount > 0) {
          totalDepreciationGenerated += depAmount;
          processedAssetsCount++;
          
          const newAccumulated = asset.accumulated_depreciation + depAmount;
          const newNetBook = asset.purchase_price - newAccumulated;
          
          return {
            ...asset,
            accumulated_depreciation: newAccumulated,
            net_book_value: newNetBook,
            last_depreciation_date: new Date().toISOString().split('T')[0]
          };
        }
        
        return asset;
      });

      localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(updatedAssets));
      setAssets(updatedAssets.filter((a: any) => a.company_id === activeCompany || !a.company_id));
      
      if (processedAssetsCount > 0) {
        toast.success(`تم تنفيذ الإهلاك لعدد ${processedAssetsCount} أصل بقيمة إجمالية ${new Intl.NumberFormat('ar-EG').format(totalDepreciationGenerated)} ج.م وإصدار القيد المحاسبي بنجاح.`);
      } else {
        toast.error("جميع الأصول مُهلكة بالكامل أو غير نشطة، لا يوجد إهلاك مستحق هذا الشهر.");
      }
      
      setIsDepreciating(false);
    }, 1500);
  };

  const calculateGainLoss = () => {
    if (!focusedAsset) return 0;
    if (disposeType === 'scrap') return -focusedAsset.net_book_value;
    return disposeAmount - focusedAsset.net_book_value;
  };

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-3">
            <div className="p-3 bg-primary-100 text-primary-700 rounded-2xl">
               <Package className="w-6 h-6" />
            </div>
            الأصول الثابتة (Fixed Assets)
          </h2>
          <p className="text-slate-500 mt-2 font-medium">سجل الأصول الدائم، حاسبة الإهلاك الشهري التلقائي، وإدارة الاستبعادات.</p>
        </div>
        
        <div className="relative z-10 flex flex-wrap gap-3">
          <button 
            onClick={handleRunDepreciation} 
            disabled={isDepreciating} 
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <RefreshCcw className={clsx("w-5 h-5 text-primary-600", isDepreciating && "animate-spin")} /> 
            {isDepreciating ? "جاري احتساب الإهلاك..." : "تنفيذ الإهلاك الشهري"}
          </button>
          <button 
            onClick={() => navigate('/assets/new')} 
            className="bg-primary-600 shadow-lg shadow-primary-600/20 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-primary-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> تسجيل أصل جديد
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">إجمالي تكلفة الأصول (Purchase Value)</p>
              <h3 className="font-black text-slate-800 text-2xl lg:text-3xl" dir="ltr">
                {new Intl.NumberFormat('ar-EG').format(assets.reduce((sum, a) => sum + a.purchase_price, 0))} EGP
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold mb-1">مجمع الإهلاك (Accumulated Dep.)</p>
              <h3 className="font-black text-rose-600 text-2xl lg:text-3xl" dir="ltr">
                -{new Intl.NumberFormat('ar-EG').format(assets.reduce((sum, a) => sum + a.accumulated_depreciation, 0))} EGP
              </h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <ArrowDownToLine className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border border-slate-100/50 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-primary-700 text-sm font-bold mb-1">صافي القيمة الدفترية (Net Book Value)</p>
              <h3 className="font-black text-primary-600 text-2xl lg:text-3xl" dir="ltr">
                {new Intl.NumberFormat('ar-EG').format(assets.reduce((sum, a) => sum + a.net_book_value, 0))} EGP
              </h3>
            </div>
            <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 overflow-hidden animate-in fade-in duration-300">
        <div className="p-6 border-b border-slate-100/80 bg-slate-50/30 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">سجل الأصول (Asset Register)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase font-black tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-start">الأصل</th>
                <th className="px-6 py-4 text-start">طريقة الإهلاك</th>
                <th className="px-6 py-4 text-end">التكلفة</th>
                <th className="px-6 py-4 text-end">مجمع الإهلاك</th>
                <th className="px-6 py-4 text-end">القيمة الدفترية</th>
                <th className="px-6 py-4 text-center">الحالة</th>
                <th className="px-6 py-4 text-end">التصرف (Disposal)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-sm">
              {assets.length > 0 ? assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100/80 border border-slate-200/60 flex items-center justify-center text-slate-500 shrink-0 shadow-sm">
                        {categoryIcons[asset.category] || <Briefcase className="w-5 h-5"/>}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{asset.name}</div>
                        <div className="text-xs text-slate-500 font-mono font-medium mt-0.5">{asset.asset_code} &bull; {categoryTranslations[asset.category] || asset.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="font-bold text-slate-800">{methodTranslations[asset.depreciation_method] || asset.depreciation_method}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{asset.useful_life_years} سنوات (عمر إنتاجي)</div>
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-slate-800" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(asset.purchase_price)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-bold text-rose-600" dir="ltr">
                    -{new Intl.NumberFormat('ar-EG').format(asset.accumulated_depreciation)}
                  </td>
                  <td className="px-6 py-4 text-end font-mono font-black text-primary-600" dir="ltr">
                    {new Intl.NumberFormat('ar-EG').format(asset.net_book_value)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      'inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-black', 
                      asset.status === 'active' ? 'bg-primary-50 text-primary-700' : 
                      asset.status === 'sold' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {asset.status === 'active' ? 'نشط' : asset.status === 'sold' ? 'مباع' : 'مهلك / مستبعد'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-end">
                     {asset.status === 'active' ? (
                        <button onClick={() => openDispose(asset)} className="text-rose-600 font-bold text-xs bg-rose-50 hover:bg-rose-100 hover:shadow-sm transition-all px-3 py-2 rounded-xl flex justify-end gap-1.5 items-center ms-auto">
                           <Trash2 className="w-3.5 h-3.5" /> استبعاد
                        </button>
                     ) : (
                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-xl">تم التصرف</span>
                     )}
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium">لا توجد أصول مسجلة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disposal Modal */}
      {activeModal === 'dispose' && focusedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800">استبعاد الأصل (Asset Disposal)</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors">
                 <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="p-6 space-y-5">
               <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60">
                  <div className="font-bold text-slate-800 text-lg mb-1">{focusedAsset.name}</div>
                  <div className="text-sm font-medium text-slate-500 flex justify-between">
                     <span>القيمة الدفترية الحالية:</span>
                     <span className="font-mono font-bold text-slate-900" dir="ltr">{new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(focusedAsset.net_book_value)}</span>
                  </div>
               </div>

               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">نوع الاستبعاد</label>
                 <div className="flex gap-2">
                     <button 
                       onClick={() => setDisposeType('sell')} 
                       className={clsx('flex-1 py-3 rounded-xl text-sm font-bold border transition-all', disposeType === 'sell' ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}
                    >
                       بيع (Sell)
                    </button>
                    <button 
                       onClick={() => setDisposeType('scrap')} 
                       className={clsx('flex-1 py-3 rounded-xl text-sm font-bold border transition-all', disposeType === 'scrap' ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')}
                    >
                       تالف / تخريد (Scrap)
                    </button>
                 </div>
               </div>

               {disposeType === 'sell' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                   <label className="block text-sm font-bold text-slate-700 mb-2">قيمة البيع (Sale Value)</label>
                   <input type="number" min="0" value={disposeAmount} onChange={(e) => setDisposeAmount(Number(e.target.value))} className="w-full bg-white border border-slate-200 text-slate-900 font-bold text-lg rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-colors shadow-sm text-right" dir="ltr" />
                 </div>
               )}

               <div className={clsx("p-5 rounded-2xl border", calculateGainLoss() >= 0 ? "bg-primary-50 border-primary-100" : "bg-rose-50 border-rose-100")}>
                  <div className={clsx("text-sm font-bold mb-1", calculateGainLoss() >= 0 ? "text-primary-800" : "text-rose-800")}>
                     {calculateGainLoss() >= 0 ? "صافي الربح الرأسمالي المتوقع (Gain)" : "صافي الخسائر الرأسمالية المتوقعة (Loss)"}
                  </div>
                  <div className={clsx("font-mono text-2xl font-black", calculateGainLoss() >= 0 ? "text-primary-600" : "text-rose-600")} dir="ltr">
                     {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(Math.abs(calculateGainLoss()))}
                  </div>
               </div>

              <div className="pt-4 border-t border-slate-100">
                 <button 
                   onClick={() => {
                     const activeCompany = getActiveCompany();
                     const localAssets = JSON.parse(localStorage.getItem(getCompanyKey('mock_assets')) || '[]');
                     const updatedAssets = localAssets.map((a: any) => a.id === focusedAsset.id ? { ...a, status: disposeType === 'sell' ? 'sold' : 'disposed' } : a);
                     localStorage.setItem(getCompanyKey('mock_assets'), JSON.stringify(updatedAssets));
                     setAssets(updatedAssets.filter((a: any) => a.company_id === activeCompany || !a.company_id));
                     
                     toast.success("تم استبعاد الأصل وإنشاء قيد اليومية الخاص بالعملية بنجاح.");
                     setActiveModal(null);
                   }}
                   className="w-full bg-rose-600 text-white font-bold py-3.5 text-sm rounded-xl hover:bg-rose-700 hover:-translate-y-0.5 shadow-lg shadow-rose-600/20 transition-all"
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
