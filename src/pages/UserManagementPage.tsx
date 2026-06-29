import { useEffect, useState } from "react";
import { type User, type Role, type PermissionMatrix } from "../types";
import { clsx } from "clsx";
import { ShieldCheck, Users as UsersIcon, Key, UserPlus, Lock, Unlock, Check, X, ShieldAlert } from "lucide-react";

export function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [activeRoleId, setActiveRoleId] = useState<string>('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('r2');
  const [editUserStatus, setEditUserStatus] = useState<'active' | 'locked'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        { id: 2, name: 'سارة خالد', email: 'sara@bohemiangeeks.com', roleId: 'r2', status: 'active', lastLogin: new Date().toISOString() }
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

  const mockModules = ['المبيعات', 'المشتريات', 'اليومية', 'الأصول', 'المشاريع', 'التقارير'];
  const actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

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
    }, 500);
  };

  const togglePermission = async (mod: string, action: string) => {
    const role = roles.find(r => r.id === activeRoleId);
    if (!role) return;
    if (role.isSystem) {
      alert("لا يمكن تعديل صلاحيات أدوار النظام الأساسية!");
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

  return (
    <div className="space-y-6">
      <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-primary-600"/> إدارة المستخدمين والصلاحيات</h2>
          <p className="text-slate-500 mt-1">التحكم في الوصول، وتحديد الأدوار والصلاحيات (RBAC)، وسياسات الأمان.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button
              onClick={() => setActiveTab('users')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'users' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <UsersIcon className="w-4 h-4"/> المستخدمين
           </button>
           <button
              onClick={() => setActiveTab('roles')}
              className={clsx(
                 "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition",
                 activeTab === 'roles' ? "bg-white text-primary-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
           >
              <Key className="w-4 h-4"/> الأدوار والصلاحيات
           </button>
        </div>
      </div>

      {activeTab === 'users' && (
         <div className="space-y-6">
            <div className="flex justify-end">
               <button onClick={() => setShowAddModal(true)} className="bg-primary-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary-700 transition">
                  <UserPlus className="w-4 h-4" /> إضافة مستخدم جديد
               </button>
            </div>
            <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-start text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-xs border-b border-slate-100">
                     <tr>
                        <th className="px-6 py-4 text-start">المستخدم</th>
                        <th className="px-6 py-4 text-start">البريد الإلكتروني</th>
                        <th className="px-6 py-4 text-start">الدور (Role)</th>
                        <th className="px-6 py-4 text-center">الحالة</th>
                        <th className="px-6 py-4 text-start">آخر تسجيل دخول</th>
                        <th className="px-6 py-4 text-end">الإجراءات</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                           <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                           <td className="px-6 py-4 font-mono text-slate-500">{user.email}</td>
                           <td className="px-6 py-4">
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{getRoleName(user.roleId)}</span>
                           </td>
                           <td className="px-6 py-4 text-center">
                              {user.status === 'active' ? (
                                 <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold"><Unlock className="w-3 h-3"/> نشط</span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded text-xs font-bold"><Lock className="w-3 h-3"/> مقفل</span>
                              )}
                           </td>
                           <td className="px-6 py-4 font-mono text-slate-500 text-xs">{new Date(user.lastLogin!).toLocaleString('ar-EG')}</td>
                           <td className="px-6 py-4 text-end">
                              <button onClick={() => {
                                 setEditingUser(user);
                                 setNewUserName(user.name);
                                 setNewUserEmail(user.email);
                                 setNewUserRole(user.roleId);
                                 setEditUserStatus(user.status);
                                 setShowEditModal(true);
                              }} className="text-primary-600 hover:underline font-bold text-xs">تعديل</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'roles' && (
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4">
               <h3 className="font-bold text-slate-800 px-2">مجموعات الصلاحيات</h3>
               {roles.map(role => (
                  <div key={role.id} onClick={() => setActiveRoleId(role.id)} className={clsx(
                     "p-4 rounded-xl border cursor-pointer transition",
                     role.id === activeRoleId ? "bg-primary-50 border-primary-200" : "bg-white border-slate-200 hover:border-primary-300"
                  )}>
                     <div className="font-bold text-slate-800">{role.name}</div>
                     <div className="text-xs text-slate-500 mt-1">{role.description}</div>
                     {role.isSystem && <div className="mt-2 text-[10px] bg-slate-100 text-slate-500 inline-block px-2 py-0.5 rounded uppercase font-bold">System Role</div>}
                  </div>
               ))}
               <button onClick={() => setShowAddRoleModal(true)} className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-500 font-bold hover:bg-slate-50 hover:text-primary-600 transition flex items-center justify-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> إنشاء دور مخصص
               </button>
            </div>
            
            <div className="lg:col-span-3">
               <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                     <h3 className="font-bold text-xl text-slate-800">مصفوفة الصلاحيات (Permission Matrix)</h3>
                     <p className="text-sm text-slate-500 mt-1">تحديد الصلاحيات الدقيقة לדور: <span className="font-bold text-primary-600">{getRoleName(activeRoleId)}</span></p>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-start text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-100">
                           <tr>
                              <th className="px-4 py-3 text-start">الوحدة (Module)</th>
                              <th className="px-4 py-3 text-center">عرض (View)</th>
                              <th className="px-4 py-3 text-center">إنشاء (Create)</th>
                              <th className="px-4 py-3 text-center">تعديل (Edit)</th>
                              <th className="px-4 py-3 text-center">حذف (Delete)</th>
                              <th className="px-4 py-3 text-center">اعتماد (Approve)</th>
                              <th className="px-4 py-3 text-center">تصدير (Export)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {mockModules.map(mod => (
                              <tr key={mod} className="hover:bg-slate-50">
                                 <td className="px-4 py-4 font-bold text-slate-700">{mod}</td>
                                 {actions.map(action => {
                                    const role = roles.find(r => r.id === activeRoleId);
                                    const isSystemAdmin = role?.isSystem && role?.name === 'Super Admin';
                                    const hasPerm = isSystemAdmin || (role?.permissions && role.permissions.includes(`${mod}_${action}`));
                                    return (
                                       <td key={action} className="px-4 py-4 text-center">
                                          <button 
                                             onClick={() => togglePermission(mod, action)}
                                             className={clsx(
                                                "inline-flex items-center justify-center w-6 h-6 rounded transition",
                                                hasPerm ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                             )}
                                          >
                                             {hasPerm && <Check className="w-4 h-4" />}
                                          </button>
                                       </td>
                                    );
                                 })}
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto overscroll-none flex flex-col items-center justify-start">
          <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">إضافة مستخدم جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" placeholder="مثال: أحمد محمد" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" placeholder="email@company.com" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الدور (Role)</label>
                <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50 font-bold">
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto overscroll-none flex flex-col items-center justify-start">
          <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-boldcel text-xl text-slate-800">تعديل بيانات المستخدم</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل</label>
                <input required type="text" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input required type="email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" dir="ltr" />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="block text-sm font-bold text-slate-700 mb-1">الدور (Role)</label>
                   <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50 font-bold">
                     {roles.map(r => (
                       <option key={r.id} value={r.id}>{r.name}</option>
                     ))}
                   </select>
                 </div>
                 <div className="flex-1">
                   <label className="block text-sm font-bold text-slate-700 mb-1">الحالة</label>
                   <select value={editUserStatus} onChange={e => setEditUserStatus(e.target.value as any)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50 font-bold">
                     <option value="active">نشط (Active)</option>
                     <option value="locked">مقفول (Locked)</option>
                   </select>
                 </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50">
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto overscroll-none flex flex-col items-center justify-start">
          <div className="flex-1 min-h-[2rem]"></div><div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-xl text-slate-800">إنشاء دور مخصص</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">اسم الدور</label>
                <input required type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" placeholder="مثال: مدير المبيعات" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">الوصف</label>
                <input type="text" value={newRoleDesc} onChange={e => setNewRoleDesc(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-primary-500 bg-slate-50" placeholder="شرح مبسط لصلاحيات هذا الدور..." />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddRoleModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 transition disabled:opacity-50">
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
