import { toast } from 'react-hot-toast';
import { useState } from "react";
import { Save, Building, Percent, Users, KeyRound, CheckCircle2, X, Palette, UploadCloud, Globe, Settings as SettingsIcon, ShieldCheck, Mail, Phone, MapPin, Hash, Trash2, Edit2, Shield, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getCompanyKey } from '../utils/storage';
import { clsx } from "clsx";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [usersList, setUsersList] = useState<User[]>(() => {
    const local = localStorage.getItem(getCompanyKey('mock_users'));
    if (local) return JSON.parse(local);
    const defaults = [
      { id: 1, name: 'أحمد صلاح', email: 'ahmed@bohemiangeeks.com', role: 'مدير نظام', status: 'مفعل', avatar: 'https://ui-avatars.com/api/?name=Ahmed+Salah&background=0D8B41&color=fff' },
      { id: 2, name: 'سارة علي', email: 'sara@bohemiangeeks.com', role: 'محاسب', status: 'مفعل', avatar: 'https://ui-avatars.com/api/?name=Sara+Ali&background=f43f5e&color=fff' },
      { id: 3, name: 'محمود خالد', email: 'mahmoud@bohemiangeeks.com', role: 'مُدخل بيانات', status: 'غير مفعل', avatar: 'https://ui-avatars.com/api/?name=Mahmoud+Khaled&background=94a3b8&color=fff' }
    ];
    localStorage.setItem(getCompanyKey('mock_users'), JSON.stringify(defaults));
    return defaults;
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('محاسب');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  const {
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    accentColor, setAccentColor,
    logoUrl, setLogoUrl,
    themeMode, setThemeMode
  } = useTheme();

  const handleFieldChange = () => setHasChanges(true);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setHasChanges(false);
      toast.success("تم حفظ جميع التعديلات بنجاح");
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordUpdateSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success("تم تحديث كلمة المرور بنجاح");
      setTimeout(() => setPasswordUpdateSuccess(false), 3000);
    }, 800);
  };

  const navItems = [
    { id: 'company', label: 'بيانات الشركة', icon: Building, desc: 'الهوية والمقر' },
    { id: 'preferences', label: 'تفضيلات النظام', icon: Globe, desc: 'اللغة والتاريخ' },
    { id: 'taxes', label: 'الضرائب والفواتير', icon: Percent, desc: 'الأسعار والشروط' },
    { id: 'users', label: 'المستخدمين والصلاحيات', icon: Users, desc: 'إدارة الفريق' },
    { id: 'security', label: 'الأمان والخصوصية', icon: ShieldCheck, desc: 'كلمة المرور والمصادقة' },
    { id: 'theme', label: 'المظهر والهوية', icon: Palette, desc: 'الألوان والشعارات' },
  ];

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-emerald-500"></div>
        <div className="ps-2">
          <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-emerald-600" />
            لوحة تحكم النظام
            <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ System Settings</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">إدارة تفضيلات النظام، بيانات الشركة، المستخدمين، والصلاحيات من مكان واحد.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-4 shrink-0 h-max sticky top-6">
          <nav className="space-y-1.5">
            {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-bold text-start",
                  activeTab === item.id 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100" 
                    : "bg-transparent text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                )}
              >
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors", activeTab === item.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[15px]">{item.label}</div>
                  <div className={clsx("text-xs font-medium mt-0.5", activeTab === item.id ? "text-emerald-600/70" : "text-slate-400")}>{item.desc}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 sm:p-8 min-h-[600px]">
          
          {/* 1. Company Profile */}
          {activeTab === 'company' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Building className="w-6 h-6 text-emerald-500" /> بيانات الشركة الأساسية
                </h3>
                <p className="text-sm font-medium text-slate-500">هذه البيانات ستظهر على الفواتير والتقارير الرسمية المصدرة من النظام.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم الشركة بالكامل</label>
                  <input type="text" onChange={handleFieldChange} defaultValue="بوهيميان جيكس (Bohemian Geeks)" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">مجال العمل / النشاط</label>
                  <input type="text" onChange={handleFieldChange} defaultValue="خدمات تقنية وتطوير برمجيات" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Hash className="w-4 h-4 text-slate-400" /> الرقم الضريبي (TIN)</label>
                  <input type="text" onChange={handleFieldChange} defaultValue="123-456-789" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold font-mono shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Hash className="w-4 h-4 text-slate-400" /> رقم السجل التجاري</label>
                  <input type="text" onChange={handleFieldChange} defaultValue="987654321" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold font-mono shadow-sm" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> عنوان المقر الرئيسي</label>
                  <textarea rows={3} onChange={handleFieldChange} defaultValue="القرية الذكية، مبنى B12، الدور الرابع، الجيزة، مصر" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm resize-none"></textarea>
                </div>
              </div>
              
              <hr className="border-slate-100" />
              
              <div>
                <h4 className="text-lg font-black text-slate-800 mb-4">التواصل والدعم</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400" /> البريد الإلكتروني الرسمي</label>
                    <input type="email" onChange={handleFieldChange} defaultValue="info@bohemiangeeks.com" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-right font-bold font-mono shadow-sm" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> رقم هاتف الشركة</label>
                    <input type="tel" onChange={handleFieldChange} defaultValue="+20 100 123 4567" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-right font-bold font-mono shadow-sm" dir="ltr" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h4 className="text-lg font-black text-slate-800 mb-4">أختام وتوقيعات الشركة</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm mb-1">ختم الشركة المعتمد</h5>
                      <p className="text-xs text-slate-500 font-medium mb-3">سيظهر على الفواتير وعروض الأسعار.</p>
                      <button onClick={handleFieldChange} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100">رفع صورة הختم</button>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-5">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shrink-0">
                      <Edit2 className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm mb-1">توقيع المدير المالي</h5>
                      <p className="text-xs text-slate-500 font-medium mb-3">يستخدم لاعتماد المستندات تلقائياً.</p>
                      <button onClick={handleFieldChange} className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100">رفع صورة التوقيع</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. System Preferences */}
          {activeTab === 'preferences' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Globe className="w-6 h-6 text-emerald-500" /> تفضيلات النظام
                </h3>
                <p className="text-sm font-medium text-slate-500">تخصيص لغة النظام، المنطقة الزمنية، والتنسيقات الإقليمية.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">لغة النظام الافتراضية</label>
                  <select onChange={handleFieldChange} defaultValue="ar" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm cursor-pointer appearance-none">
                    <option value="ar">العربية (Arabic)</option>
                    <option value="en">English (الإنجليزية)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">المنطقة الزمنية (Timezone)</label>
                  <select onChange={handleFieldChange} defaultValue="Cairo" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm cursor-pointer appearance-none">
                    <option value="Cairo">Africa/Cairo (GMT+2/3)</option>
                    <option value="Riyadh">Asia/Riyadh (GMT+3)</option>
                    <option value="Dubai">Asia/Dubai (GMT+4)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تنسيق التاريخ (Date Format)</label>
                  <select onChange={handleFieldChange} defaultValue="YYYY-MM-DD" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold font-mono shadow-sm cursor-pointer appearance-none">
                    <option value="YYYY-MM-DD">2026-06-30 (YYYY-MM-DD)</option>
                    <option value="DD/MM/YYYY">30/06/2026 (DD/MM/YYYY)</option>
                    <option value="MM/DD/YYYY">06/30/2026 (MM/DD/YYYY)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">شهر بداية السنة المالية</label>
                  <select onChange={handleFieldChange} defaultValue="1" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm cursor-pointer appearance-none">
                    <option value="1">يناير (January)</option>
                    <option value="4">أبريل (April)</option>
                    <option value="7">يوليو (July)</option>
                    <option value="10">أكتوبر (October)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. Taxes & Billing */}
          {activeTab === 'taxes' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Percent className="w-6 h-6 text-emerald-500" /> إعدادات الضرائب والفواتير
                </h3>
                <p className="text-sm font-medium text-slate-500">ضبط إعدادات الضرائب الافتراضية، العملات، وشروط الدفع للفواتير.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">ضريبة القيمة المضافة الافتراضية (%)</label>
                  <div className="relative">
                    <input type="number" onChange={handleFieldChange} defaultValue="14" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 pe-12 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold font-mono shadow-sm" />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">عملة النظام الافتراضية</label>
                  <select onChange={handleFieldChange} defaultValue="EGP" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm cursor-pointer appearance-none">
                    <option value="EGP">جنيه مصري (EGP)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="SAR">ريال سعودي (SAR)</option>
                  </select>
                </div>
                
                <div className="md:col-span-2 bg-slate-50 rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">الأسعار المدخلة تشمل الضريبة (Tax Inclusive)</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1">تفعيل هذا الخيار سيجعل النظام يستقطع الضريبة من السعر المدخل بدلاً من إضافتها عليه.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" onChange={handleFieldChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">شروط الدفع القياسية (تُطبع أسفل الفواتير)</label>
                  <textarea rows={3} onChange={handleFieldChange} defaultValue="برجاء سداد قيمة الفاتورة خلال 30 يوم من تاريخ الإصدار. المعاملات البنكية يجب أن تتضمن رقم الفاتورة في وصف التحويل." className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold shadow-sm resize-none"></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">بادئة الفاتورة التلقائية (Invoice Prefix)</label>
                  <input type="text" onChange={handleFieldChange} defaultValue="INV-2026-" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold font-mono text-right shadow-sm" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 text-rose-600">تاريخ إغلاق الفترة (Period Lock Date)</label>
                  <input type="date" onChange={handleFieldChange} defaultValue="2026-05-31" className="w-full bg-rose-50/30 border border-rose-200 text-rose-900 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-bold font-mono shadow-sm" />
                  <p className="text-xs font-bold text-rose-500 mt-2 flex items-center gap-1"><Shield className="w-3 h-3" /> يمنع ترحيل أي قيود لتاريخ قبل هذا اليوم.</p>
                </div>
              </div>
            </div>
          )}

          {/* 4. Users & Roles */}
          {activeTab === 'users' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                    <Users className="w-6 h-6 text-emerald-500" /> إدارة فريق العمل
                  </h3>
                  <p className="text-sm font-medium text-slate-500">إضافة مستخدمين، تعيين الصلاحيات، وإدارة الوصول للنظام.</p>
                </div>
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 shrink-0"
                >
                  + إضافة مستخدم جديد
                </button>
              </div>
              
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-start border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-start font-black">المستخدم</th>
                      <th className="px-6 py-4 text-start font-black">الدور (Role)</th>
                      <th className="px-6 py-4 text-start font-black">الحالة</th>
                      <th className="px-6 py-4 text-center font-black">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                    {usersList.map((user) => (
                      <tr key={user.id} className="bg-white hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f1f5f9&color=64748b`} alt={user.name} className="w-10 h-10 rounded-full border border-slate-200 shadow-sm" />
                            <div>
                              <div className="font-bold text-slate-900">{user.name}</div>
                              <div className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-bold inline-flex border",
                            user.role === 'مدير نظام' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                            user.role === 'محاسب' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={clsx("w-2 h-2 rounded-full", user.status === 'مفعل' ? "bg-emerald-500" : "bg-slate-300")}></div>
                            <span className={clsx("font-bold", user.status === 'مفعل' ? "text-emerald-700" : "text-slate-500")}>{user.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Security */}
          {activeTab === 'security' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" /> الأمان والخصوصية
                </h3>
                <p className="text-sm font-medium text-slate-500">حماية حسابك عن طريق تحديث كلمة المرور وتفعيل المصادقة الثنائية.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3">تغيير كلمة المرور</h4>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور الحالية</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? "text" : "password"} 
                        required 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono shadow-sm text-right pe-12" 
                      />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"} 
                        required 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono shadow-sm text-right pe-12" 
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono shadow-sm text-right" 
                    />
                  </div>
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isUpdatingPassword}
                      className={clsx(
                        "w-full py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95",
                        passwordUpdateSuccess ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-slate-900 text-white hover:bg-slate-800"
                      )}
                    >
                      {isUpdatingPassword ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : passwordUpdateSuccess ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : <ShieldCheck className="w-5 h-5" />}
                      <span>{isUpdatingPassword ? 'جاري التحديث...' : passwordUpdateSuccess ? 'تم التحديث بنجاح' : 'تحديث كلمة المرور'}</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-3">إعدادات المصادقة</h4>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 end-0 p-6 opacity-5">
                      <Shield className="w-32 h-32 text-emerald-900" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                        <KeyRound className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h5 className="font-black text-slate-800 text-lg mb-2">المصادقة الثنائية (2FA)</h5>
                      <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">أضف طبقة حماية إضافية لحسابك. عند تفعيل هذه الميزة، ستحتاج إلى رمز مرور من هاتفك لتسجيل الدخول.</p>
                      <button onClick={handleFieldChange} className="bg-white border border-slate-200 text-slate-800 font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors shadow-sm">
                        تفعيل الميزة (Setup 2FA)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. Theme & Branding */}
          {activeTab === 'theme' && (
            <div className="animate-in slide-in-from-bottom-2 fade-in duration-300 space-y-8">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-2">
                  <Palette className="w-6 h-6 text-emerald-500" /> المظهر والهوية البصرية
                </h3>
                <p className="text-sm font-medium text-slate-500">تخصيص ألوان النظام، الشعار، ووضع العرض ليتماشى مع هوية شركتك.</p>
              </div>
              
              <div className="space-y-8 max-w-3xl">
                {/* Logo Upload */}
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">شعار النظام الأساسي</h4>
                  <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <div className="w-28 h-28 bg-white rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                      {logoUrl ? (
                         <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                         <span className="text-sm font-bold text-slate-400">بدون شعار</span>
                      )}
                    </div>
                    <div>
                       <input type="file" className="hidden" id="logo-upload" accept="image/*" onChange={(e) => {
                         if(e.target.files && e.target.files[0]) {
                            const url = URL.createObjectURL(e.target.files[0]);
                            setLogoUrl(url);
                            setHasChanges(true);
                         }
                       }} />
                       <label htmlFor="logo-upload" className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-2.5 rounded-xl text-sm font-bold cursor-pointer hover:bg-emerald-100 transition-colors flex items-center gap-2 w-max mb-3">
                         <UploadCloud className="w-4 h-4" /> رفع صورة جديدة
                       </label>
                       <p className="text-xs font-medium text-slate-500 leading-relaxed">أفضل أبعاد 256x256 بيكسل.<br/>الصيغ المدعومة: PNG (شفاف), JPG. أقصى حجم: 2MB.</p>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">ألوان النظام (Theme Colors)</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Primary */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">اللون الأساسي (Primary)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        {['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#0f172a'].map(color => (
                          <button 
                            key={color} 
                            onClick={() => { setPrimaryColor(color); setHasChanges(true); }}
                            style={{ backgroundColor: color }}
                            className={clsx(
                              "w-12 h-12 rounded-2xl border-4 transition-all shadow-sm",
                              primaryColor === color ? "border-white ring-2 ring-emerald-500 scale-110" : "border-transparent hover:scale-110"
                            )}
                          ></button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Secondary */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">اللون الثانوي (Secondary)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        {['#0f172a', '#1e293b', '#334155', '#475569', '#172554', '#064e3b'].map(color => (
                          <button 
                            key={color} 
                            onClick={() => { setSecondaryColor(color); setHasChanges(true); }}
                            style={{ backgroundColor: color }}
                            className={clsx(
                              "w-12 h-12 rounded-2xl border-4 transition-all shadow-sm",
                              secondaryColor === color ? "border-white ring-2 ring-slate-800 scale-110" : "border-transparent hover:scale-110"
                            )}
                          ></button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Mode */}
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">وضع الشاشة (Display Mode)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button 
                      onClick={() => { setThemeMode('light'); setHasChanges(true); }}
                      className={clsx(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3",
                        themeMode === 'light' ? "border-emerald-500 bg-emerald-50/50" : "border-slate-100 bg-white hover:border-slate-200"
                      )}
                    >
                      <div className="w-16 h-10 rounded shadow-sm border border-slate-200 bg-white flex flex-col p-1 gap-1">
                        <div className="w-full h-2 bg-slate-100 rounded-sm"></div>
                        <div className="w-1/2 h-4 bg-slate-50 rounded-sm"></div>
                      </div>
                      <span className="font-bold text-sm text-slate-800">الفاتح (Light)</span>
                    </button>
                    
                    <button 
                      onClick={() => { setThemeMode('dark'); setHasChanges(true); }}
                      className={clsx(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed",
                        themeMode === 'dark' ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-white"
                      )}
                      title="قريباً"
                    >
                      <div className="w-16 h-10 rounded shadow-sm border border-slate-700 bg-slate-800 flex flex-col p-1 gap-1">
                        <div className="w-full h-2 bg-slate-700 rounded-sm"></div>
                        <div className="w-1/2 h-4 bg-slate-900 rounded-sm"></div>
                      </div>
                      <span className="font-bold text-sm text-slate-800">الداكن (Dark)</span>
                    </button>

                    <button 
                      onClick={() => { setThemeMode('system'); setHasChanges(true); }}
                      className={clsx(
                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 opacity-50 cursor-not-allowed",
                        themeMode === 'system' ? "border-emerald-500 bg-emerald-50" : "border-slate-100 bg-white"
                      )}
                      title="قريباً"
                    >
                      <div className="w-16 h-10 rounded shadow-sm border border-slate-300 bg-gradient-to-r from-white to-slate-800 flex flex-col p-1 gap-1">
                      </div>
                      <span className="font-bold text-sm text-slate-800">تلقائي (System)</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className={clsx(
        "fixed bottom-0 start-0 lg:start-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/60 p-4 flex items-center justify-between lg:justify-end gap-4 shadow-[0_-10px_30px_rgb(0,0,0,0.05)] z-40 transition-transform duration-500",
        hasChanges ? "translate-y-0" : "translate-y-full"
      )}>
        <div className="hidden sm:block text-slate-600 font-bold text-sm">
          لديك تغييرات غير محفوظة!
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setHasChanges(false)}
            className="flex-1 sm:flex-none px-6 py-3 rounded-2xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            تجاهل
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-2 sm:flex-none px-8 py-3 rounded-2xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-w-[160px]"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : showSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{isSaving ? 'جاري الحفظ...' : showSuccess ? 'تم الحفظ بنجاح' : 'حفظ التعديلات'}</span>
          </button>
        </div>
      </div>

      {/* Add User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUserModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-black text-slate-800">إضافة مستخدم جديد</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!newUserName || !newUserEmail) return;
                const nextUsers = [...usersList, {
                  id: Date.now(),
                  name: newUserName,
                  email: newUserEmail,
                  role: newUserRole,
                  status: 'مفعل',
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUserName)}&background=10b981&color=fff`
                }];
                setUsersList(nextUsers);
                localStorage.setItem(getCompanyKey('mock_users'), JSON.stringify(nextUsers));
                setIsUserModalOpen(false);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserRole('محاسب');
                toast.success("تم إضافة المستخدم بنجاح");
              }} 
              className="p-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم بالكامل</label>
                <input 
                  type="text" 
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold" 
                  placeholder="مثال: أحمد محمد"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-mono font-bold text-right" 
                  dir="ltr"
                  placeholder="ahmed@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الصلاحية (الدور)</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold cursor-pointer appearance-none"
                >
                  <option value="محاسب">محاسب (وصول كامل للحسابات)</option>
                  <option value="مدير نظام">مدير نظام (تحكم كامل)</option>
                  <option value="مُدخل بيانات">مُدخل بيانات (محدود)</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl text-sm font-bold hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="flex-2 bg-emerald-600 text-white py-3.5 px-6 rounded-2xl text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  حفظ وإضافة المستخدم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
