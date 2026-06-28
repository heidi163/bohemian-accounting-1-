import { useState, useEffect } from "react";
import { FileSignature, Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Banknote, CalendarDays, Building2, User, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

interface Check {
  id: string;
  type: "issued" | "received";
  checkNumber: string;
  amount: number;
  date: string;
  dueDate: string;
  bankName: string;
  partyName: string; // Payee or Payer
  status: "pending" | "cleared" | "bounced";
  notes?: string;
}

const mockChecks: Check[] = [
  { id: "CHK-001", type: "issued", checkNumber: "001234", amount: 25000, date: "2023-10-15", dueDate: "2023-11-15", bankName: "البنك الأهلي", partyName: "شركة الموردين المتحدين", status: "pending" },
  { id: "CHK-002", type: "received", checkNumber: "998877", amount: 15000, date: "2023-10-20", dueDate: "2023-10-25", bankName: "بنك مصر", partyName: "مؤسسة الأفق", status: "cleared" },
  { id: "CHK-003", type: "issued", checkNumber: "001235", amount: 8000, date: "2023-10-22", dueDate: "2023-12-01", bankName: "البنك التجاري الدولي", partyName: "الشركة العربية للتجارة", status: "bounced" },
  { id: "CHK-004", type: "received", checkNumber: "554433", amount: 32000, date: "2023-10-25", dueDate: "2023-11-10", bankName: "بنك القاهرة", partyName: "مجموعة الأندلس", status: "pending" },
];

export function ChecksPage() {
  const [activeTab, setActiveTab] = useState<"issued" | "received">("issued");
  const [checks, setChecks] = useState<Check[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCheck, setNewCheck] = useState<Partial<Check>>({
    type: "issued",
    status: "pending",
  });

  useEffect(() => {
    const local = localStorage.getItem("mock_checks");
    if (local) {
      setChecks(JSON.parse(local));
    } else {
      setChecks(mockChecks);
      localStorage.setItem("mock_checks", JSON.stringify(mockChecks));
    }
  }, []);

  const handleSaveCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheck.checkNumber || !newCheck.amount || !newCheck.partyName || !newCheck.bankName) {
      alert("الرجاء تعبئة جميع الحقول المطلوبة (رقم الشيك، المبلغ، اسم البنك، واسم الطرف الآخر)");
      return;
    }
    
    const check: Check = {
      id: `CHK-${Math.floor(Math.random() * 10000)}`,
      type: newCheck.type as "issued" | "received",
      checkNumber: newCheck.checkNumber,
      amount: Number(newCheck.amount),
      date: newCheck.date || new Date().toISOString().split("T")[0],
      dueDate: newCheck.dueDate || new Date().toISOString().split("T")[0],
      bankName: newCheck.bankName,
      partyName: newCheck.partyName,
      status: newCheck.status as "pending" | "cleared" | "bounced",
      notes: newCheck.notes,
    };

    const updated = [check, ...checks];
    setChecks(updated);
    localStorage.setItem("mock_checks", JSON.stringify(updated));
    setIsModalOpen(false);
    setNewCheck({ type: activeTab, status: "pending" });
    setStatusFilter("all"); // Reset filter so the new check appears in the table
    alert("تم حفظ الشيك بنجاح!");
  };

  const handleUpdateStatus = (id: string, newStatus: "pending" | "cleared" | "bounced") => {
    const updated = checks.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setChecks(updated);
    localStorage.setItem("mock_checks", JSON.stringify(updated));
  };

  const filteredChecks = checks.filter(c => {
    const matchesTab = c.type === activeTab;
    const matchesSearch = c.partyName.includes(searchTerm) || c.checkNumber.includes(searchTerm) || c.bankName.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesTab && matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cleared': return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> محصل/مصروف</span>;
      case 'bounced': return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> مرتجع</span>;
      default: return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> معلق</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FileSignature className="w-6 h-6" />
            </div>
            إدارة الشيكات
          </h1>
          <p className="text-slate-500 mt-1 text-sm">متابعة الشيكات الصادرة والواردة وتواريخ استحقاقها</p>
        </div>
        <button 
          onClick={() => {
            setNewCheck({ type: activeTab, status: "pending" });
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          إضافة شيك جديد
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-slate-100 pb-4">
          
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab("issued")}
              className={clsx(
                "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                activeTab === "issued" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ArrowUpRight className="w-4 h-4" />
              شيكات صادرة
            </button>
            <button
              onClick={() => setActiveTab("received")}
              className={clsx(
                "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                activeTab === "received" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ArrowDownLeft className="w-4 h-4" />
              شيكات واردة
            </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="بحث برقم الشيك أو الاسم..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-10 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">معلق</option>
              <option value="cleared">محصل / مصروف</option>
              <option value="bounced">مرتجع</option>
            </select>
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">رقم الشيك / البنك</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">{activeTab === 'issued' ? 'المستفيد' : 'الساحب'}</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">المبلغ</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">تاريخ الإصدار</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">تاريخ الاستحقاق</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">الحالة</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredChecks.length > 0 ? (
                filteredChecks.map(check => (
                  <tr key={check.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx("p-2 rounded-lg", activeTab === 'issued' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-600')}>
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">#{check.checkNumber}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3"/> {check.bankName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <User className="w-4 h-4 text-slate-400" />
                        {check.partyName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-bold text-slate-900">{check.amount.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 ms-1">ر.س</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-slate-400"/> {check.date}</div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-slate-700">
                      <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500"/> {check.dueDate}</div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(check.status)}
                    </td>
                    <td className="px-4 py-4 text-end">
                      <select
                        value={check.status}
                        onChange={(e) => handleUpdateStatus(check.id, e.target.value as any)}
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-2 py-1.5 outline-none hover:border-primary cursor-pointer transition-all"
                      >
                        <option value="pending">تغيير لـ معلق</option>
                        <option value="cleared">تغيير لـ محصل/مصروف</option>
                        <option value="bounced">تغيير لـ مرتجع</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                      <Filter className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">لا توجد شيكات</h3>
                    <p className="text-slate-500">لم يتم العثور على شيكات تطابق معايير البحث.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-primary" />
                إضافة شيك جديد
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-500 hover:bg-slate-100 p-1 rounded-lg transition"
              >
                <AlertCircle className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCheck} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نوع الشيك</label>
                  <select
                    value={newCheck.type}
                    onChange={(e) => setNewCheck({...newCheck, type: e.target.value as any})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="issued">شيك صادر (دفع)</option>
                    <option value="received">شيك وارد (قبض)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">رقم الشيك</label>
                  <input
                    type="text"
                    required
                    value={newCheck.checkNumber || ""}
                    onChange={(e) => setNewCheck({...newCheck, checkNumber: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="مثال: 1002938"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">اسم البنك</label>
                  <input
                    type="text"
                    required
                    value={newCheck.bankName || ""}
                    onChange={(e) => setNewCheck({...newCheck, bankName: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="مثال: البنك الأهلي"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{newCheck.type === 'issued' ? 'اسم المستفيد' : 'اسم الساحب'}</label>
                  <input
                    type="text"
                    required
                    value={newCheck.partyName || ""}
                    onChange={(e) => setNewCheck({...newCheck, partyName: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="اسم الشركة أو الشخص..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الإصدار</label>
                  <input
                    type="date"
                    required
                    value={newCheck.date || ""}
                    onChange={(e) => setNewCheck({...newCheck, date: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">تاريخ الاستحقاق</label>
                  <input
                    type="date"
                    required
                    value={newCheck.dueDate || ""}
                    onChange={(e) => setNewCheck({...newCheck, dueDate: e.target.value})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">حالة الشيك</label>
                  <select
                    value={newCheck.status}
                    onChange={(e) => setNewCheck({...newCheck, status: e.target.value as any})}
                    className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  >
                    <option value="pending">معلق</option>
                    <option value="cleared">محصل / مصروف</option>
                    <option value="bounced">مرتجع</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">المبلغ</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      value={newCheck.amount || ""}
                      onChange={(e) => setNewCheck({...newCheck, amount: Number(e.target.value)})}
                      className="w-full bg-white border border-slate-200 text-slate-900 text-sm font-bold rounded-xl px-4 py-2.5 pe-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">ر.س</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition shadow-sm"
                >
                  حفظ الشيك
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
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
