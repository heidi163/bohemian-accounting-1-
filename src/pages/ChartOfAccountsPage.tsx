import { toast } from 'react-hot-toast';
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { Copy, Plus, Filter, Search, ChevronDown, ChevronUp, X, Briefcase, DollarSign, ShieldCheck, Activity } from "lucide-react";
import { getCompanyKey, getActiveCompany } from '../utils/storage';

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  level: string;
  parent_code: string | null;
  company_id: string;
  is_active: boolean;
}

const typeTranslations: Record<string, string> = {
  asset: 'أصول',
  liability: 'خصوم',
  equity: 'حقوق ملكية',
  revenue: 'إيرادات',
  expense: 'مصروفات',
};

const levelTranslations: Record<string, string> = {
  main: 'رئيسي',
  sub: 'فرعي',
  detail: 'تفصيلي',
};

export function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountTypes, setAccountTypes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [expandedCodes, setExpandedCodes] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    code: '', name: '', type: '', level: 'detail', parent_code: '', company_id: 'ALL', is_active: true
  });

  const loadAccounts = async () => {
    let loadedAccounts: Account[] = [];
    let typesData: any[] = [];
    
    try {
      const [resAcc, resTypes] = await Promise.all([
        fetch('/api/accounts').then(res => res.json()),
        fetch('/api/account-types').then(res => res.json())
      ]);
      loadedAccounts = resAcc.data;
      typesData = resTypes.data;
    } catch (error) {
      console.error("Failed to load accounts, using local storage fallback", error);
      
      const localAccounts = JSON.parse(localStorage.getItem(getCompanyKey('mock_accounts')) || '[]');
      if (localAccounts.length > 0) {
        loadedAccounts = localAccounts;
      } else {
        loadedAccounts = [
          { id: 1, code: '1', name: 'الأصول', type: 'asset', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
          { id: 2, code: '11', name: 'الأصول المتداولة', type: 'asset', level: 'sub', parent_code: '1', company_id: 'ALL', is_active: true },
          { id: 3, code: '111', name: 'النقدية بالبنوك', type: 'asset', level: 'detail', parent_code: '11', company_id: 'ALL', is_active: true },
          { id: 4, code: '112', name: 'العملاء', type: 'asset', level: 'detail', parent_code: '11', company_id: 'ALL', is_active: true },
          { id: 5, code: '2', name: 'الخصوم', type: 'liability', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
          { id: 6, code: '3', name: 'حقوق الملكية', type: 'equity', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
          { id: 7, code: '4', name: 'الإيرادات', type: 'revenue', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
          { id: 8, code: '5', name: 'المصروفات', type: 'expense', level: 'main', parent_code: null, company_id: 'ALL', is_active: true },
        ];
        localStorage.setItem(getCompanyKey('mock_accounts'), JSON.stringify(loadedAccounts));
      }
      
      typesData = [
        { id: "asset", name_ar: "أصول" },
        { id: "liability", name_ar: "خصوم" },
        { id: "equity", name_ar: "حقوق ملكية" },
        { id: "revenue", name_ar: "إيرادات" },
        { id: "expense", name_ar: "مصروفات" }
      ];
    }
    
    const currentCompany = getActiveCompany();
    const activeCompanyAccounts = loadedAccounts.filter((acc: Account) => acc.company_id === 'ALL' || acc.company_id === currentCompany);

    setAccounts(activeCompanyAccounts);
    setAccountTypes(typesData);
    if (typesData.length > 0 && !newAccount.type) {
      setNewAccount(prev => ({...prev, type: typesData[0].id.toString()}));
    }
    
    setExpandedCodes(prev => {
      const newExpanded = new Set(prev);
      activeCompanyAccounts.forEach((acc: Account) => {
        if (acc.level !== 'detail' && prev.size === 0) {
          newExpanded.add(acc.code);
        }
      });
      return newExpanded;
    });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const toggleExpand = (code: string) => {
    const newExpanded = new Set(expandedCodes);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedCodes(newExpanded);
  };

  const filteredAccounts = accounts.filter(acc => {
    return acc.code.includes(search) || acc.name.includes(search);
  });

  // Build tree
  const buildTree = (parentCode: string | null) => {
    return filteredAccounts
      .filter(acc => acc.parent_code === parentCode)
      .map(acc => {
        const children = buildTree(acc.code);
        const hasChildren = children.length > 0;
        const isExpanded = expandedCodes.has(acc.code);
        
        return (
          <div key={acc.code} className="w-full">
            <div className={clsx(
              "flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors",
              acc.level === 'main' ? 'bg-slate-50 font-bold' : '',
              acc.level === 'sub' ? 'bg-white font-semibold' : '',
              acc.level === 'detail' ? 'bg-white text-slate-600' : ''
            )}>
              <div className="flex items-center gap-3 w-1/3">
                <div 
                  style={{ paddingInlineStart: `${acc.parent_code ? acc.parent_code.length * 12 : 0}px` }} 
                  className="flex items-center gap-2"
                >
                  {hasChildren ? (
                    <button onClick={() => toggleExpand(acc.code)} className="p-1 hover:bg-slate-200 rounded text-slate-500">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  ) : <div className="w-6" />}
                  <span className="font-mono text-sm bg-slate-100 px-2 rounded">{acc.code}</span>
                  <span>{acc.name}</span>
                </div>
              </div>
              <div className="w-1/6 text-sm">{typeTranslations[acc.type]}</div>
              <div className="w-1/6 text-sm flex gap-2">
                <span className={clsx("px-2 py-0.5 rounded text-xs border", 
                  acc.level === 'main' ? 'bg-slate-100 border-slate-200' : 
                  acc.level === 'sub' ? 'bg-blue-50 border-blue-100 text-blue-700' : 
                  'bg-primary-50 border-primary-100 text-primary-700'
                )}>{levelTranslations[acc.level]}</span>
              </div>
              <div className="w-1/6 flex items-center justify-center">
                 <span className="text-xs bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md font-bold">
                   {acc.company_id === 'ALL' ? getActiveCompany() : acc.company_id}
                 </span>
              </div>
              <div className="w-1/6 text-end">
                <span className={clsx("text-xs px-2 py-1 rounded inline-block", acc.is_active ? 'bg-primary-100 text-primary-700' : 'bg-rose-100 text-rose-700')}>
                  {acc.is_active ? 'نشط' : 'معطل'}
                </span>
              </div>
            </div>
            {hasChildren && isExpanded && (
              <div className="w-full">
                {children}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إجمالي الحسابات</span>
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><Briefcase className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-slate-900">{accounts.length} حساب</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إجمالي الأصول</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><ShieldCheck className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-blue-600">{accounts.filter(a => a.type === 'asset').length} حساب</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إجمالي الخصوم</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><Activity className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-rose-600">{accounts.filter(a => a.type === 'liability').length} حساب</div>
        </div>
        <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
          <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
            <span>إيرادات ومصروفات</span>
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><DollarSign className="w-4 h-4"/></div>
          </div>
          <div className="text-2xl font-black text-primary-600">{accounts.filter(a => a.type === 'revenue' || a.type === 'expense').length} حساب</div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 p-6 flex flex-col overflow-hidden">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h1 className="text-2xl font-bold text-slate-800">شجرة الحسابات</h1>
            <p className="text-slate-500 mt-1">إعدادات الدليل المحاسبي للشركات التابعة</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            إضافة حساب جديد
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="بحث برقم الحساب أو الاسم..." 
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pe-10 ps-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="border border-slate-100 rounded-2xl overflow-hidden">
          <div className="flex bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider p-4 border-b border-slate-100">
            <div className="w-1/3 ps-4 text-start">الحساب</div>
            <div className="w-1/6 text-start">النوع</div>
            <div className="w-1/6 text-start">المستوى</div>
            <div className="w-1/6 text-center">الشركة</div>
            <div className="w-1/6 text-end pe-4">الحالة</div>
          </div>
          <div className="w-full text-start">
            {buildTree(null)}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm text-center p-4 sm:p-0">
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إضافة حساب جديد</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newAccount.code || !newAccount.name) return;
                
                try {
                  const payload = {
                    id: Date.now(),
                    code: newAccount.code,
                    name: newAccount.name,
                    type: newAccount.type,
                    level: newAccount.level,
                    parent_code: newAccount.parent_code || null,
                    company_id: newAccount.company_id,
                    is_active: newAccount.is_active
                  };

                  try {
                    const res = await fetch('/api/accounts', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    if (!res.ok) throw new Error('API failed');
                    const data = await res.json();
                    if (!data.success) throw new Error('API reported failure');
                  } catch (e) {
                    const localAccounts = JSON.parse(localStorage.getItem(getCompanyKey('mock_accounts')) || '[]');
                    localAccounts.push(payload);
                    localStorage.setItem(getCompanyKey('mock_accounts'), JSON.stringify(localAccounts));
                  }
                  
                  await loadAccounts();
                  if (payload.parent_code) {
                    setExpandedCodes(prev => {
                      const newSet = new Set(prev);
                      newSet.add(payload.parent_code as string);
                      return newSet;
                    });
                  }
                  setIsModalOpen(false);
                  setNewAccount({
                    code: '', name: '', type: 'asset', level: 'detail', parent_code: '', company_id: 'ALL', is_active: true
                  });
                  toast.success("تم إضافة الحساب بنجاح!");
                } catch (error) {
                  console.error("Failed to add account", error);
                  toast.error("حدث خطأ أثناء إضافة الحساب");
                }
              }} 
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رقم الحساب (الكود)</label>
                  <input 
                    type="text" 
                    required
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({...newAccount, code: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" 
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">اسم الحساب</label>
                  <input 
                    type="text" 
                    required
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">النوع</label>
                  <select 
                    value={newAccount.type}
                    onChange={(e) => setNewAccount({...newAccount, type: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  >
                    {accountTypes.map((type: any) => (
                      <option key={type.id} value={type.id}>{type.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">المستوى</label>
                  <select 
                    value={newAccount.level}
                    onChange={(e) => setNewAccount({...newAccount, level: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  >
                    {Object.entries(levelTranslations).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الحساب الأب (إن وجد)</label>
                  <input 
                    type="text" 
                    value={newAccount.parent_code || ''}
                    onChange={(e) => setNewAccount({...newAccount, parent_code: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" 
                    dir="ltr"
                    placeholder="مثال: 111"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">الشركة</label>
                  <select 
                    value={newAccount.company_id}
                    onChange={(e) => setNewAccount({...newAccount, company_id: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  >
                    <option value="ALL">جميع الشركات</option>
                    <option value="BGK">بوهيميان جيكس (BGK)</option>
                    <option value="O2N">شركة O2N</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={newAccount.is_active}
                  onChange={(e) => setNewAccount({...newAccount, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">حساب نشط (مفعل)</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
                >
                  حفظ الحساب
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
