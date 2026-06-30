import { toast } from 'react-hot-toast';
import { useEffect, useState, useMemo } from "react";
import { type User, type Role } from "../types";
import { clsx } from "clsx";
import { 
  ShieldCheck, Users as UsersIcon, Key, UserPlus, Lock, Unlock, 
  Check, X, ShieldAlert, Search, Filter, Shield, MoreVertical, 
  UserCheck, UserX, Activity
} from "lucide-react";
import { getCompanyKey } from '../utils/storage';
import { SearchableSelect } from '../components/ui/SearchableSelect';
export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  
  // Form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [activeRoleId, setActiveRoleId] = useState<string>('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('r2');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'locked'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchData = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.data.users);
      setRoles(data.data.roles);
      if (!activeRoleId && data.data.roles.length > 0) {
        setActiveRoleId(data.data.roles[0].id);
      }
    } catch {
      const localUsers = localStorage.getItem('mock_users_mgmt');
      const localRoles = localStorage.getItem('mock_roles_mgmt');
      
      let parsedUsers = localUsers ? JSON.parse(localUsers) : [
        { id: 1, name: 'أحمد صلاح', email: 'admin@bohemiangeeks.com', roleId: 'r1', status: 'active', lastLogin: new Date().toISOString() },
        { id: 2, name: 'سارة خالد', email: 'sara@bohemiangeeks.com', roleId: 'r2', status: 'active', lastLogin: new Date().toISOString() },
        { id: 3, name: 'مصطفى كمال', email: 'mostafa@bohemiangeeks.com', roleId: 'r2', status: 'locked', lastLogin: new Date(Date.now() - 86400000 * 5).toISOString() }
      ];
      let parsedRoles = localRoles ? JSON.parse(localRoles) : [
        { id: 'r1', name: 'Super Admin', description: 'صلاحيات كاملة لجميع وحدات النظام', isSystem: true, permissions: [] },
        { id: 'r2', name: 'محاسب', description: 'الوصول لليومية والمصروفات فقط', isSystem: false, permissions: ['اليومية_view', 'اليومية_create'] },
      ];

      setUsers(parsedUsers);
      setRoles(parsedRoles);
      if (!activeRoleId && parsedRoles.length > 0) {
        setActiveRoleId(parsedRoles[0].id);
      }
      
      if (!localUsers) localStorage.setItem('mock_users_mgmt', JSON.stringify(parsedUsers));
      if (!localRoles) localStorage.setItem('mock_roles_mgmt', JSON.stringify(parsedRoles));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRoleName = (roleId: string) => roles.find(r => r.id === roleId)?.name || 'Unknown';

  const mockModules = ['المبيعات', 'المشتريات', 'اليومية', 'الأصول', 'المشاريع', 'التقارير', 'الإعدادات'];
  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

  // Handlers
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newUser = {
        id: Date.now(),
        name: newUserName,
        email: newUserEmail,
        roleId: newUserRole,
        status: 'active',
        lastLogin: new Date().toISOString()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers as any);
      localStorage.setItem('mock_users_mgmt', JSON.stringify(updatedUsers));
      
      setShowAddModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setIsSubmitting(false);
      toast.success("تمت إضافة المستخدم بنجاح!");
    }, 500);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const updatedUsers = users.map(u => 
        u.id === editingUser.id ? { ...u, name: newUserName, email: newUserEmail, roleId: newUserRole, status: editUserStatus } : u
      );
      setUsers(updatedUsers as any);
      localStorage.setItem('mock_users_mgmt', JSON.stringify(updatedUsers));
      setShowEditModal(false);
      setIsSubmitting(false);
      toast.success("تم تحديث بيانات المستخدم بنجاح!");
    }, 500);
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const newRole = {
        id: 'r' + Date.now(),
        name: newRoleName,
        description: newRoleDesc,
        isSystem: false,
        permissions: []
      };
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      localStorage.setItem('mock_roles_mgmt', JSON.stringify(updatedRoles));
      
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setIsSubmitting(false);
      toast.success("تم إضافة الدور بنجاح!");
    }, 500);
  };

  const togglePermission = async (mod: string, action: string) => {
    const role = roles.find(r => r.id === activeRoleId);
    if (!role) return;
    if (role.isSystem) {
      toast.error("عفواً، لا يمكن تعديل صلاحيات أدوار النظام الأساسية (System Roles).");
      return;
    }
    const permKey = `${mod}_${action}`;
    const newPerms = role.permissions?.includes(permKey) 
      ? role.permissions.filter(p => p !== permKey) 
      : [...(role.permissions || []), permKey];
      
    const updatedRoles = roles.map(r => r.id === activeRoleId ? { ...r, permissions: newPerms } : r);
    setRoles(updatedRoles);
    localStorage.setItem('mock_roles_mgmt', JSON.stringify(updatedRoles));
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  // Metrics calculation
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const lockedUsers = users.filter(u => u.status === 'locked').length;
  const totalRoles = roles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-black text-slate-800 text-3xl flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-primary-600"/> إدارة الوصول (RBAC)
          </h2>
          <p className="text-slate-500 mt-2 font-medium">نظام متقدم للتحكم في الصلاحيات وحماية البيانات المؤسسية.</p>
        </div>
        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
           <button
              onClick={() => setActiveTab('users')}
              className={clsx(
                 "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300",
                 activeTab === 'users' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
           >
              <UsersIcon className="w-4 h-4"/> المستخدمين
           </button>
           <button
              onClick={() => setActiveTab('roles')}
              className={clsx(
                 "px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300",
                 activeTab === 'roles' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
              )}
           >
              <Key className="w-4 h-4"/> مصفوفة الصلاحيات
           </button>
        </div>
      </div>

      {activeTab === 'users' && (
         <div className="space-y-6">
            {/* Top Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
                     <span>إجمالي الحسابات</span>
                     <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600"><UsersIcon className="w-4 h-4"/></div>
                  </div>
                  <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
               </div>

               <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
                     <span>نشط الآن</span>
                     <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><UserCheck className="w-4 h-4"/></div>
                  </div>
                  <div className="text-3xl font-black text-emerald-600">{activeUsers}</div>
               </div>

               <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
                     <span>مقفل (محظور)</span>
                     <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600"><UserX className="w-4 h-4"/></div>
                  </div>
                  <div className="text-3xl font-black text-rose-600">{lockedUsers}</div>
               </div>

               <div className="bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-sm font-bold text-slate-500 mb-3 flex justify-between items-center">
                     <span>مجموعات الصلاحيات</span>
                     <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"><Shield className="w-4 h-4"/></div>
                  </div>
                  <div className="text-3xl font-black text-primary-600">{totalRoles}</div>
               </div>
            </div>

            {/* Search, Filter & Actions */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
               <div className="flex flex-1 w-full gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                     <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                     </div>
                     <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو البريد..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 text-slate-900 text-sm rounded-2xl focus:ring-primary-500 focus:border-primary-500 block ps-10 p-3 font-medium outline-none transition-all focus:bg-white"
                     />
                  </div>
                  
                  <div className="relative w-48">
                     <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                     </div>
                     <SearchableSelect 
                        value={roleFilter}
                        onChange={setRoleFilter}
                        options={[
                          { value: 'all', label: 'كل الأدوار' },
                          ...roles.map(r => ({ value: r.id, label: r.name }))
                        ]}
                        allowCreate={false}
                     />
                  </div>
               </div>

               <button onClick={() => setShowAddModal(true)} className="w-full md:w-auto bg-primary-600 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-700 transition shadow-sm hover:shadow shrink-0">
                  <UserPlus className="w-4 h-4" /> مستخدم جديد
               </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] overflow-hidden">
               {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                     <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                     <p className="font-bold text-lg text-slate-600">لا يوجد مستخدمين</p>
                     <p className="text-sm mt-1">جرب تغيير كلمات البحث أو الفلتر.</p>
                  </div>
               ) : (
                  <table className="w-full text-start text-sm">
                     <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-xs border-b border-slate-100">
                        <tr>
                           <th className="px-6 py-5 text-start tracking-wider">المستخدم</th>
                           <th className="px-6 py-5 text-start tracking-wider">البريد الإلكتروني</th>
                           <th className="px-6 py-5 text-start tracking-wider">الدور (Role)</th>
                           <th className="px-6 py-5 text-center tracking-wider">الحالة</th>
                           <th className="px-6 py-5 text-start tracking-wider">آخر نشاط</th>
                           <th className="px-6 py-5 text-end tracking-wider"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(user => (
                           <tr key={user.id} className="hover:bg-slate-50/50 transition group">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-600">
                                       {user.name.charAt(0)}
                                    </div>
                                    <div className="font-bold text-slate-900">{user.name}</div>
                                 </div>
                              </td>
                              <td className="px-6 py-5 font-mono text-slate-500">{user.email}</td>
                              <td className="px-6 py-5">
                                 <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                                    {getRoleName(user.roleId)}
                                 </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                 {user.status === 'active' ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold">
                                       <Unlock className="w-3 h-3"/> نشط
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg text-xs font-bold">
                                       <Lock className="w-3 h-3"/> مقفل
                                    </span>
                                 )}
                              </td>
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
                                    <Activity className="w-3 h-3" />
                                    {new Date(user.lastLogin!).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-end">
                                 <button onClick={() => {
                                    setEditingUser(user);
                                    setNewUserName(user.name);
                                    setNewUserEmail(user.email);
                                    setNewUserRole(user.roleId);
                                    setEditUserStatus(user.status);
                                    setShowEditModal(true);
                                 }} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition">
                                    <MoreVertical className="w-5 h-5" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               )}
            </div>
         </div>
      )}

      {activeTab === 'roles' && (
         <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Roles Sidebar */}
            <div className="xl:col-span-1 space-y-4 bg-white p-5 rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] max-h-[800px] overflow-y-auto custom-scrollbar border-0">
               <h3 className="font-bold text-slate-800 px-2 flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" /> مجموعات الصلاحيات
               </h3>
               {roles.map(role => (
                  <div key={role.id} onClick={() => setActiveRoleId(role.id)} className={clsx(
                     "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group",
                     role.id === activeRoleId 
                        ? "bg-primary-600 border-primary-600 shadow-md text-white" 
                        : "bg-white border-slate-100 hover:border-primary-200 hover:bg-slate-50"
                  )}>
                     {role.id === activeRoleId && <div className="absolute top-0 right-0 w-2 h-full bg-white/20"></div>}
                     <div className={clsx("font-bold text-lg", role.id === activeRoleId ? "text-white" : "text-slate-800")}>
                        {role.name}
                     </div>
                     <div className={clsx("text-xs mt-1 leading-relaxed", role.id === activeRoleId ? "text-white/80" : "text-slate-500")}>
                        {role.description}
                     </div>
                     {role.isSystem && (
                        <div className={clsx(
                           "mt-3 text-[10px] inline-block px-2.5 py-1 rounded-lg uppercase font-black tracking-wider",
                           role.id === activeRoleId ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                           System Role
                        </div>
                     )}
                  </div>
               ))}
               <button onClick={() => setShowAddRoleModal(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 transition flex items-center justify-center gap-2 mt-4">
                  <ShieldAlert className="w-5 h-5" /> إنشاء دور مخصص
               </button>
            </div>
            
            {/* Permission Matrix Main Panel */}
            <div className="xl:col-span-3">
               <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden h-full flex flex-col">
                  <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                     <div>
                        <h3 className="font-black text-2xl text-slate-800">مصفوفة التحكم الدقيق</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">تحديد الصلاحيات للدور المحدد على مستوى الوحدات والإجراءات.</p>
                     </div>
                     <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-center shrink-0">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">الدور النشط</div>
                        <div className="font-black text-primary-600">{getRoleName(activeRoleId)}</div>
                     </div>
                  </div>
                  
                  <div className="overflow-x-auto flex-1 p-4">
                     <table className="w-full text-start text-sm border-separate border-spacing-y-2">
                        <thead className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                           <tr>
                              <th className="px-4 py-3 text-start bg-slate-50/50 rounded-r-xl">الوحدة (Module)</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50">عرض</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50">إنشاء</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50">تعديل</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50">حذف</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50">اعتماد</th>
                              <th className="px-4 py-3 text-center bg-slate-50/50 rounded-l-xl">تصدير</th>
                           </tr>
                        </thead>
                        <tbody>
                           {mockModules.map(mod => (
                              <tr key={mod} className="group">
                                 <td className="px-4 py-4 font-bold text-slate-700 bg-white rounded-r-xl border-y border-r border-slate-100 group-hover:border-primary-100 transition-colors">
                                    {mod}
                                 </td>
                                 {actions.map((action, i) => {
                                    const role = roles.find(r => r.id === activeRoleId);
                                    const isSystemAdmin = role?.isSystem && role?.name === 'Super Admin';
                                    const hasPerm = isSystemAdmin || (role?.permissions && role.permissions.includes(`${mod}_${action}`));
                                    return (
                                       <td key={action} className={clsx(
                                          "px-4 py-4 text-center bg-white border-y border-slate-100 group-hover:border-primary-100 transition-colors",
                                          i === actions.length - 1 && "rounded-l-xl border-l"
                                       )}>
                                          <button 
                                             onClick={() => togglePermission(mod, action)}
                                             disabled={isSystemAdmin}
                                             className="group inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                             <Check 
                                                className={clsx(
                                                   "w-6 h-6 transition-all", 
                                                   hasPerm ? "text-emerald-500 opacity-100 scale-110" : "text-slate-300 opacity-0 group-hover:opacity-100"
                                                )} 
                                                strokeWidth={3} 
                                             />
                                          </button>
                                       </td>
                                    );
                                 })}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                     
                     {roles.find(r => r.id === activeRoleId)?.isSystem && (
                        <div className="mt-8 flex items-center gap-3 p-5 rounded-2xl border border-amber-100 bg-amber-50 text-amber-800">
                           <ShieldAlert className="w-5 h-5 shrink-0" />
                           <div className="text-sm font-bold">هذا الدور أساسي (System Role) وله صلاحيات مطلقة لا يمكن تعديلها. لإنشاء صلاحيات مخصصة، قم بإنشاء دور جديد.</div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Modals remain mostly the same structurally, just UI polish applied in classes above but I'll update their wrapper classes for consistency */}
      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm text-center p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl text-start overflow-visible shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <h3 className="font-black text-xl text-slate-800">إضافة مستخدم جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" placeholder="مثال: أحمد محمد" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" placeholder="email@company.com" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الدور (Role)</label>
                <SearchableSelect 
                  value={newUserRole} 
                  onChange={setNewUserRole} 
                  options={roles.map(r => ({ value: r.id, label: r.name }))}
                  allowCreate={true}
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 px-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-2xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50 shadow-sm hover:shadow">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm text-center p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl text-start overflow-visible shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <h3 className="font-black text-xl text-slate-800">تعديل بيانات المستخدم</h3>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الاسم الكامل</label>
                <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">البريد الإلكتروني</label>
                <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" dir="ltr" />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-sm font-bold text-slate-700 mb-2">الدور</label>
                   <SearchableSelect 
                     value={newUserRole} 
                     onChange={setNewUserRole} 
                     options={roles.map(r => ({ value: r.id, label: r.name }))}
                     allowCreate={true}
                   />
                 </div>
                 <div className="flex-1">
                   <label className="block text-sm font-bold text-slate-700 mb-2">الحالة</label>
                   <SearchableSelect 
                     value={editUserStatus} 
                     onChange={(val) => setEditUserStatus(val as any)} 
                     options={[
                       { value: 'active', label: 'نشط' },
                       { value: 'locked', label: 'مقفول' }
                     ]}
                     allowCreate={false}
                   />
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3.5 px-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-2xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50 shadow-sm hover:shadow">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ROLE MODAL */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/60 backdrop-blur-sm text-center p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl text-start overflow-visible shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
              <h3 className="font-black text-xl text-slate-800">إنشاء دور مخصص</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRole} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">اسم الدور</label>
                <input required type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" placeholder="مثال: مراجع مالي" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الوصف</label>
                <input type="text" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-primary-500 bg-slate-50 transition" placeholder="شرح مبسط لصلاحيات هذا الدور..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddRoleModal(false)} className="flex-1 py-3.5 px-4 rounded-2xl font-bold border-2 border-slate-100 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-2xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50 shadow-sm hover:shadow">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الدور'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
