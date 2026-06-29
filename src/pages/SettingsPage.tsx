import { useState } from "react";
import { Save, Building, Percent, Users, KeyRound, CheckCircle2, X, Palette, UploadCloud } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { getCompanyKey } from '../utils/storage';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [usersList, setUsersList] = useState<User[]>(() => {
    const local = localStorage.getItem(getCompanyKey('mock_users'));
    if (local) return JSON.parse(local);
    const defaults = [
      { id: 1, name: 'أحمد محمد', email: 'ahmed@bohemiangeeks.com', role: 'مدير نظام', status: 'مفعل' },
      { id: 2, name: 'سارة علي', email: 'sara@bohemiangeeks.com', role: 'محاسب', status: 'مفعل' },
      { id: 3, name: 'محمود خالد', email: 'mahmoud@bohemiangeeks.com', role: 'مُدخل بيانات', status: 'غير مفعل' }
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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);

  const {
    primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor,
    accentColor, setAccentColor,
    logoUrl, setLogoUrl,
    themeMode, setThemeMode
  } = useTheme();

  const handleSave = () => {
    setIsSaving(true);
    // محاكاة عملية الحفظ
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    setIsUpdatingPassword(true);
    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordUpdateSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordUpdateSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-lg">الإعدادات العامة</h2>
          <p className="text-sm text-slate-500 mt-1">قم بضبط تفضيلات النظام وبيانات الشركة الأساسية.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-xl text-sm font-semibold transition flex items-center space-x-2  shrink-0 ${
            showSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'
          } disabled:opacity-75`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : showSuccess ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'جاري الحفظ...' : showSuccess ? 'تم الحفظ بنجاح' : 'حفظ جميع التعديلات'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar navigation for settings */}
        <div className="w-full md:w-64 bg-slate-50 border-b md:border-b-0 md:border-e border-slate-200 p-4 shrink-0">
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('company')}
              className={`w-full flex items-center space-x-3  px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'company' 
                  ? 'bg-white shadow-sm text-primary border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Building className="w-5 h-5 shrink-0" />
              <span>بيانات الشركة</span>
            </button>
            <button 
              onClick={() => setActiveTab('taxes')}
              className={`w-full flex items-center space-x-3  px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'taxes' 
                  ? 'bg-white shadow-sm text-primary border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Percent className="w-5 h-5 opacity-70 shrink-0" />
              <span>الضرائب والفواتير</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3  px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'users' 
                  ? 'bg-white shadow-sm text-primary border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-5 h-5 opacity-70 shrink-0" />
              <span>المستخدمين والصلاحيات</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3  px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'security' 
                  ? 'bg-white shadow-sm text-primary border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <KeyRound className="w-5 h-5 opacity-70 shrink-0" />
              <span>الأمان وكلمة المرور</span>
            </button>
            <button 
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center space-x-3  px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === 'theme' 
                  ? 'bg-white shadow-sm text-primary border border-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              <Palette className="w-5 h-5 opacity-70 shrink-0" />
              <span>المظهر والهوية البصرية</span>
            </button>
          </nav>
        </div>

        {/* Settings content pane */}
        <div className="flex-1 p-6 sm:p-8">
          {activeTab === 'company' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">بيانات الشركة الأساسية</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">اسم الشركة بالكامل</label>
                <input type="text" defaultValue="بوهيميان جيكس (Bohemian Geeks)" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">مجال العمل / النشاط</label>
                <input type="text" defaultValue="خدمات تقنية وتطوير برمجيات" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الرقم الضريبي (TIN)</label>
                <input type="text" defaultValue="123-456-789" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">رقم السجل التجاري</label>
                <input type="text" defaultValue="987654321" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">عنوان المقر الرئيسي</label>
                  <textarea rows={3} defaultValue="القرية الذكية، مبنى B12، الدور الرابع، الجيزة، مصر" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
              </div>
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-4">التواصل والدعم</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني للشركة</label>
                  <input type="email" defaultValue="info@bohemiangeeks.com" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">رقم الهاتف الأساسي</label>
                  <input type="tel" defaultValue="+20 100 123 4567" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

          {activeTab === 'taxes' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">إعدادات الضرائب والفواتير</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ضريبة القيمة المضافة الافتراضية (%)</label>
                    <input type="number" defaultValue="14" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">عملة النظام الافتراضية</label>
                    <select defaultValue="EGP" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all">
                      <option value="EGP">جنيه مصري (EGP)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">شروط الدفع القياسية (تظهر على الفواتير)</label>
                    <textarea rows={3} defaultValue="برجاء سداد قيمة الفاتورة خلال 30 يوم من تاريخ الإصدار. المعاملات البنكية يجب أن تتضمن رقم الفاتورة في وصف التحويل." className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">بادئة الفاتورة التلقائية (Prefix)</label>
                    <input type="text" defaultValue="INV-2026-" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" dir="ltr" />
                  </div>
                  <div className="lg:col-span-2">
                     <hr className="my-2 border-slate-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">تاريخ إغلاق الفترة (Period Lock validation)</label>
                    <input type="date" defaultValue="2026-05-31" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                    <p className="text-xs text-slate-500 mt-2">لا يمكن ترحيل أو تعديل أي قيود لتاريخ قبل هذا اليوم.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">المستخدمين والصلاحيات</h3>
                  <p className="text-sm text-slate-500 mt-1">إدارة الأشخاص المصرح لهم بالدخول للنظام وصلاحياتهم.</p>
                </div>
                <button 
                  onClick={() => setIsUserModalOpen(true)}
                  className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/20 transition"
                >
                  إضافة مستخدم
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
                <table className="w-full text-start border-collapse">
                  <thead className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-widest border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3 text-start">الاسم</th>
                      <th className="px-5 py-3 text-start">البريد الإلكتروني</th>
                      <th className="px-5 py-3 text-start">الصلاحية</th>
                      <th className="px-5 py-3 text-start">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-600 divide-y divide-slate-100">
                    {usersList.map((user) => (
                      <tr key={user.id} className="bg-white hover:bg-slate-50">
                        <td className="px-5 py-4 font-semibold text-slate-900">{user.name}</td>
                        <td className="px-5 py-4">{user.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            user.role === 'مدير نظام' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className={`px-5 py-4 font-semibold ${
                          user.status === 'مفعل' ? 'text-emerald-600' : 'text-slate-400'
                        }`}>{user.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">الأمان وكلمة المرور</h3>
              <p className="text-sm text-slate-500 mb-8">قم بتحديث كلمة المرور الخاصة بك وإعدادات الأمان لحماية حسابك.</p>
              
              <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الحالية</label>
                  <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">كلمة المرور الجديدة</label>
                  <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                  <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" />
                </div>
                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center space-x-2  ${
                      passwordUpdateSuccess ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                    } disabled:opacity-75`}
                  >
                    {isUpdatingPassword ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-2"></div>
                    ) : passwordUpdateSuccess ? (
                      <CheckCircle2 className="w-4 h-4 mx-2" />
                    ) : null}
                    <span>{isUpdatingPassword ? 'جاري التحديث...' : passwordUpdateSuccess ? 'تم التحديث بنجاح' : 'تحديث كلمة المرور'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'theme' && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-6">المظهر والهوية البصرية</h3>
              
              <div className="space-y-8">
                {/* Logo Upload */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">شعار الشركة (Logo)</h4>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer">
                      {logoUrl ? (
                         <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xs text-slate-400 font-bold">150x150</span>
                      )}
                    </div>
                    <div>
                       <input type="file" className="hidden" id="logo-upload" accept="image/*" onChange={(e) => {
                         if(e.target.files && e.target.files[0]) {
                            const url = URL.createObjectURL(e.target.files[0]);
                            setLogoUrl(url);
                         }
                       }} />
                       <label htmlFor="logo-upload" className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-50 transition flex items-center gap-2 w-max">
                         <UploadCloud className="w-4 h-4" /> رفع شعار جديد
                       </label>
                       <p className="text-xs text-slate-500 mt-2">الصيغ المدعومة: PNG, JPG, SVG. الحجم الأقصى: 2MB.</p>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Primary Color */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">اللون الأساسي (Primary Color)</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {['#4f46e5', '#2563eb', '#059669', '#e11d48', '#d97706', '#1e293b'].map(color => (
                       <button 
                         key={color} 
                         onClick={() => setPrimaryColor(color)}
                         style={{ backgroundColor: color }}
                         className={`w-10 h-10 rounded-full border-4 ${primaryColor === color ? 'border-primary-200 ring-2 ring-primary ring-offset-2' : 'border-transparent'} hover:scale-110 transition-transform`}
                       ></button>
                    ))}
                    
                    <div className="flex items-center gap-2 border-r   border-slate-200 pe-3   ms-1  ">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:scale-110 transition-transform cursor-pointer shadow-sm group">
                        <input 
                          type="color" 
                          value={primaryColor} 
                          onChange={(e) => setPrimaryColor(e.target.value)} 
                          className="absolute inset-0 w-20 h-20 -top-5 -left-5 cursor-pointer opacity-0 z-10"
                          title="اختر لون مخصص"
                        />
                        <div 
                          className="w-full h-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Palette className="w-5 h-5 text-white drop-shadow-md mix-blend-overlay" />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 text-sm font-mono text-slate-700 font-bold uppercase bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:bg-white transition-all text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Secondary Color */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">اللون الثانوي (Secondary Color)</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {['#1e293b', '#334155', '#475569', '#64748b', '#0f172a', '#172554'].map(color => (
                       <button 
                         key={color} 
                         onClick={() => setSecondaryColor(color)}
                         style={{ backgroundColor: color }}
                         className={`w-10 h-10 rounded-full border-4 ${secondaryColor === color ? 'border-primary-200 ring-2 ring-primary ring-offset-2' : 'border-transparent'} hover:scale-110 transition-transform`}
                       ></button>
                    ))}
                    
                    <div className="flex items-center gap-2 border-r   border-slate-200 pe-3   ms-1  ">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:scale-110 transition-transform cursor-pointer shadow-sm group">
                        <input 
                          type="color" 
                          value={secondaryColor} 
                          onChange={(e) => setSecondaryColor(e.target.value)} 
                          className="absolute inset-0 w-20 h-20 -top-5 -left-5 cursor-pointer opacity-0 z-10"
                        />
                        <div 
                          className="w-full h-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: secondaryColor }}
                        >
                          <Palette className="w-5 h-5 text-white drop-shadow-md mix-blend-overlay" />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20 text-sm font-mono text-slate-700 font-bold uppercase bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:bg-white transition-all text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Accent Color */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">لون التمييز (Accent Color)</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {['#f59e0b', '#fbbf24', '#d97706', '#b45309', '#ea580c', '#eab308'].map(color => (
                       <button 
                         key={color} 
                         onClick={() => setAccentColor(color)}
                         style={{ backgroundColor: color }}
                         className={`w-10 h-10 rounded-full border-4 ${accentColor === color ? 'border-primary-200 ring-2 ring-primary ring-offset-2' : 'border-transparent'} hover:scale-110 transition-transform`}
                       ></button>
                    ))}
                    
                    <div className="flex items-center gap-2 border-r   border-slate-200 pe-3   ms-1  ">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:scale-110 transition-transform cursor-pointer shadow-sm group">
                        <input 
                          type="color" 
                          value={accentColor} 
                          onChange={(e) => setAccentColor(e.target.value)} 
                          className="absolute inset-0 w-20 h-20 -top-5 -left-5 cursor-pointer opacity-0 z-10"
                        />
                        <div 
                          className="w-full h-full flex items-center justify-center transition-colors"
                          style={{ backgroundColor: accentColor }}
                        >
                          <Palette className="w-5 h-5 text-white drop-shadow-md mix-blend-overlay" />
                        </div>
                      </div>
                      <input 
                        type="text" 
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-20 text-sm font-mono text-slate-700 font-bold uppercase bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:bg-white transition-all text-center"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Theme Mode */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">وضع الشاشة (Theme Mode)</h4>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeMode" value="light" checked={themeMode === 'light'} onChange={() => setThemeMode('light')} className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-bold text-slate-700">الفاتح (Light)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeMode" value="dark" checked={themeMode === 'dark'} onChange={() => setThemeMode('dark')} className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-bold text-slate-700">الداكن (Dark)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="themeMode" value="system" checked={themeMode === 'system'} onChange={() => setThemeMode('system')} className="w-4 h-4 text-primary focus:ring-primary" />
                      <span className="text-sm font-bold text-slate-700">تلقائي مع النظام (System)</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">إضافة مستخدم جديد</h3>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 transition"
              >
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
                  status: 'مفعل'
                }];
                setUsersList(nextUsers);
                localStorage.setItem(getCompanyKey('mock_users'), JSON.stringify(nextUsers));
                setIsUserModalOpen(false);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserRole('محاسب');
              }} 
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الاسم بالكامل</label>
                <input 
                  type="text" 
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-right" 
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">الصلاحية</label>
                <select 
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                >
                  <option value="محاسب">محاسب</option>
                  <option value="مدير نظام">مدير نظام</option>
                  <option value="مُدخل بيانات">مُدخل بيانات</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition"
                >
                  حفظ المستخدم
                </button>
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
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
