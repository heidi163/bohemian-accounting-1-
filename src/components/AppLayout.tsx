import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard, FileText, BookOpen, Users, WalletCards, Settings,
  Network, ShoppingCart, Box, Receipt, Landmark, Briefcase, Target,
  FolderKanban, LineChart, BarChart4, LockKeyhole, ShieldCheck,
  FolderOpen, ShieldAlert, Bot, Globe, DownloadCloud, Mail,
  Banknote, Calculator, ChevronDown, Building2, LogOut, Menu, X, FileSignature
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeCompany, setActiveCompany, primaryColor, secondaryColor, logoUrl } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const authUser = localStorage.getItem("auth_user");
    if (!authUser) {
      navigate("/login");
    }
  }, [navigate]);

  const navigation = [
    { group: "الرئيسية", items: [
      { name: 'لوحة القيادة', href: '/', icon: LayoutDashboard },
    ]},
    { group: "المبيعات والمشتريات", items: [
      { name: 'المبيعات والفواتير', href: '/invoices', icon: FileText },
      { name: 'المشتريات', href: '/purchases', icon: ShoppingCart },
      { name: 'العملاء والموردون', href: '/contacts', icon: Users },
    ]},
    { group: "المحاسبة العامة", items: [
      { name: 'شجرة الحسابات', href: '/accounts', icon: Network },
      { name: 'دفتر اليومية', href: '/journal', icon: BookOpen },
      { name: 'البنوك والنقد', href: '/banks', icon: WalletCards },
      { name: 'إدارة الشيكات', href: '/checks', icon: FileSignature },
      { name: 'تعدد العملات', href: '/multi-currency', icon: Globe },
    ]},
    { group: "الموارد البشرية", items: [
      { name: 'الموظفين', href: '/employees', icon: Users },
      { name: 'الرواتب', href: '/payroll', icon: FileText },
      { name: 'السُّلَف', href: '/employees/advances', icon: Banknote },
      { name: 'حاسبة نهاية الخدمة', href: '/employees/end-of-service', icon: Calculator },
    ]},
    { group: "الأصول والالتزامات", items: [
      { name: 'الأصول الثابتة', href: '/assets', icon: Box },
      { name: 'الضرائب', href: '/taxes', icon: Receipt },
      { name: 'إدارة القروض', href: '/loans', icon: Landmark },
      { name: 'حسابات الشركاء', href: '/partners', icon: Briefcase },
    ]},
    { group: "التحليل والتقارير", items: [
      { name: 'التقارير المالية', href: '/reports', icon: BarChart4 },
      { name: 'مُنشئ التقارير', href: '/report-builder', icon: FolderKanban },
      { name: 'تحليل الربحية', href: '/profitability', icon: BarChart4 },
      { name: 'مراكز التكلفة', href: '/cost-centers', icon: Target },
      { name: 'حسابات المشاريع', href: '/projects', icon: FolderKanban },
      { name: 'توقعات التدفق النقدي', href: '/cash-flow', icon: LineChart },
    ]},
    { group: "الإدارة والأمان", items: [
      { name: 'إغلاق الفترات', href: '/period-closing', icon: LockKeyhole },
      { name: 'إدارة الصلاحيات', href: '/users', icon: ShieldCheck },
      { name: 'التدقيق والامتثال', href: '/audit-compliance', icon: ShieldAlert },
      { name: 'الأتمتة والمهام', href: '/automation', icon: Bot },
      { name: 'مركز البيانات والملفات', href: '/file-management', icon: FolderOpen },
      { name: 'قوالب البريد', href: '/email-templates', icon: Mail },
      { name: 'الإعدادات', href: '/settings', icon: Settings },
    ]},
  ];

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-900 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          backgroundColor: secondaryColor,
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.3) 100%)`
        }}
        className={clsx(
        "fixed inset-y-0 start-0 z-50 w-72 md:w-64 text-white flex flex-col border-e border-slate-800/50 shrink-0 transition-transform duration-300 md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 h-14 shrink-0">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover shrink-0 bg-white" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: primaryColor }}>
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-base tracking-tight truncate">{activeCompany === "BGK" ? "Bohemian Geeks" : "O2Nation"}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Switcher */}
        <div className="px-3 py-2 border-b border-white/5 relative">
          <button
            onClick={() => setShowCompanyMenu(!showCompanyMenu)}
            className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 transition px-3 py-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-white">
                {activeCompany === "BGK" ? "Bohemian Geeks" : "O2Nation"}
              </span>
              <span className="text-[10px] bg-primary/30 text-primary px-1.5 py-0.5 rounded font-bold">{activeCompany}</span>
            </div>
            <ChevronDown className={clsx("w-4 h-4 text-slate-400 transition-transform", showCompanyMenu && "rotate-180")} />
          </button>
          {showCompanyMenu && (
            <div className="absolute top-full start-3 end-3 mt-1 bg-[#1D2D44] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
              {(["BGK", "O2N"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => { setActiveCompany(c); setShowCompanyMenu(false); }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-4 py-3 text-sm transition hover:bg-white/10",
                    activeCompany === c ? "text-primary font-bold" : "text-slate-300"
                  )}
                >
                  <Building2 className="w-4 h-4" />
                  {c === "BGK" ? "Bohemian Geeks (BGK)" : "O2Nation (O2N)"}
                  {activeCompany === c && <span className="ms-auto text-primary text-xs"> نشط</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
          {navigation.map((group) => (
            <div key={group.group}>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">{group.group}</div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={clsx(
                        isActive
                          ? 'bg-white/10 text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white',
                        'flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl transition-all duration-300 text-sm font-medium'
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0 transition-transform duration-300" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ backgroundColor: primaryColor }}>أ</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">أحمد صلاح</div>
            <div className="text-[10px] text-slate-400 truncate">Super Admin</div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("auth_user");
              navigate("/login");
            }}
            title="تسجيل الخروج"
            className="text-slate-500 hover:text-rose-400 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden md:p-3 md:ps-0 transition-all duration-500">
        <div className="flex-1 flex flex-col bg-[#F8FAFC] md:rounded-[2rem] shadow-sm overflow-hidden relative border border-slate-100/50">
          
          {/* Topbar (Glassmorphism) */}
          <header className="sticky top-0 z-20 h-14 backdrop-blur-md bg-white/70 flex items-center justify-between px-4 md:px-6 shrink-0 transition-all">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1.5 -ms-1.5 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 hidden sm:inline">{activeCompany === "BGK" ? "Bohemian Geeks" : "O2Nation"}</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="truncate font-medium">النظام المحاسبي</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg font-bold hidden sm:inline-block shadow-sm">● متصل</span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md transition-transform hover:scale-105 cursor-pointer" style={{ backgroundColor: primaryColor }}>أ</div>
            </div>
          </header>

          {/* Page Content */}
          <div id="main-scroll-container" key={`${location.pathname}-${activeCompany}`} className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto animate-smooth-up relative z-10">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
