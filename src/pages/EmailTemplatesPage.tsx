import { useState } from "react";
import { Mail, Eye, Edit2, Save, X, FileText, Send, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

const defaultTemplates = [
  {
    id: "invoice_new",
    name: "فاتورة جديدة للعميل",
    subject: "فاتورة رقم {{invoice_number}} من {{company_name}}",
    body: `<div style="font-family:Cairo,sans-serif;direction:rtl;padding:24px">
  <h2>عزيزي {{customer_name}}</h2>
  <p>نرفق لكم الفاتورة رقم <strong>{{invoice_number}}</strong> بتاريخ {{invoice_date}} بإجمالي <strong>{{total_amount}} {{currency}}</strong>.</p>
  <p>تاريخ الاستحقاق: {{due_date}}</p>
  <p>شكراً لتعاملكم معنا.</p>
  <p>مع تحيات فريق {{company_name}}</p>
</div>`,
    variables: ["invoice_number", "customer_name", "invoice_date", "total_amount", "currency", "due_date", "company_name"],
  },
  {
    id: "invoice_reminder",
    name: "تذكير بسداد الفاتورة",
    subject: "تذكير: الفاتورة {{invoice_number}} تستحق في {{due_date}}",
    body: `<div style="font-family:Cairo,sans-serif;direction:rtl;padding:24px">
  <h2>تذكير بالسداد</h2>
  <p>نودّ تذكيركم بأن الفاتورة رقم <strong>{{invoice_number}}</strong> بمبلغ <strong>{{amount_due}} {{currency}}</strong> تستحق السداد بتاريخ {{due_date}}.</p>
  <p>يرجى التكرم بالسداد في أقرب وقت.</p>
</div>`,
    variables: ["invoice_number", "amount_due", "currency", "due_date"],
  },
  {
    id: "payslip",
    name: "قسيمة راتب الموظف",
    subject: "قسيمة راتب شهر {{period}} - {{employee_name}}",
    body: `<div style="font-family:Cairo,sans-serif;direction:rtl;padding:24px">
  <h2>قسيمة راتب شهر {{period}}</h2>
  <p>عزيزي {{employee_name}}، نرفق لكم قسيمة الراتب الخاصة بكم.</p>
  <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse">
    <tr><td>الراتب الأساسي</td><td>{{basic_salary}} EGP</td></tr>
    <tr><td>البدلات</td><td>{{allowances}} EGP</td></tr>
    <tr><td>الخصومات</td><td>-{{deductions}} EGP</td></tr>
    <tr><td><strong>الصافي</strong></td><td><strong>{{net_salary}} EGP</strong></td></tr>
  </table>
</div>`,
    variables: ["period", "employee_name", "basic_salary", "allowances", "deductions", "net_salary"],
  },
  {
    id: "daily_summary",
    name: "ملخص يومي للإدارة",
    subject: "ملخص يوم {{date}} - {{company_name}}",
    body: `<div style="font-family:Cairo,sans-serif;direction:rtl;padding:24px">
  <h2>ملخص اليوم {{date}}</h2>
  <ul>
    <li>فواتير صادرة: {{invoices_issued}}</li>
    <li>مدفوعات مستلمة: {{payments_received}} EGP</li>
    <li>مصروفات مسجّلة: {{expenses_recorded}} EGP</li>
    <li>الرصيد النقدي الحالي: {{cash_balance}} EGP</li>
  </ul>
</div>`,
    variables: ["date", "company_name", "invoices_issued", "payments_received", "expenses_recorded", "cash_balance"],
  },
];

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selected, setSelected] = useState(templates[0]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ subject: selected.subject, body: selected.body });
  const [preview, setPreview] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleSelect = (tpl: typeof templates[0]) => {
    setSelected(tpl);
    setEditData({ subject: tpl.subject, body: tpl.body });
    setEditing(false);
    setPreview(false);
  };

  const handleSave = () => {
    setTemplates(templates.map(t => t.id === selected.id ? { ...t, ...editData } : t));
    setSelected({ ...selected, ...editData });
    setEditing(false);
    showToast("تم حفظ التعديلات على القالب بنجاح!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-primary-500"></div>
        <div className="ps-2">
          <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary-600" />
            قوالب البريد الإلكتروني
            <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ Email Templates</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">تخصيص رسائل البريد الإلكتروني المرسلة تلقائياً. استخدم المتغيرات لسحب البيانات الفعلية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates Sidebar */}
        <div className="space-y-4 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 p-5 lg:h-[calc(100vh-13rem)] lg:overflow-y-auto">
          <h3 className="font-black text-slate-800 text-lg px-2 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> القوالب المتاحة
          </h3>
          <div className="space-y-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={clsx(
                  "w-full text-start p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 font-bold",
                  selected.id === t.id
                    ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                    : "bg-transparent border border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100"
                )}
              >
                <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors", selected.id === t.id ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-400")}>
                  <Mail className="w-4 h-4" />
                </div>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Main Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] border-0 overflow-hidden flex flex-col lg:h-[calc(100vh-13rem)]">
          
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100/60 bg-white gap-4 shrink-0">
            <div>
              <h3 className="font-black text-slate-800 text-xl">{selected.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">تعديل قالب الرسالة والمتغيرات</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPreview(!preview)} 
                className={clsx(
                  "px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2", 
                  preview ? "bg-slate-800 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                <Eye className="w-4 h-4" /> {preview ? "العودة للمحرر" : "معاينة الرسالة"}
              </button>
              
              {!editing && !preview && (
                <button 
                  onClick={() => setEditing(true)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> تعديل القالب
                </button>
              )}
              
              {editing && (
                <>
                  <button 
                    onClick={() => { setEditing(false); setEditData({ subject: selected.subject, body: selected.body }); }} 
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> إلغاء
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> حفظ التعديلات
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-slate-50/30">
            
            {/* Variables Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
              <span className="text-sm text-slate-500 font-bold mb-3 block flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" /> المتغيرات المتاحة للاستخدام:
              </span>
              <div className="flex flex-wrap gap-2.5">
                {selected.variables.map(v => (
                  <code 
                    key={v} 
                    className="bg-slate-100 text-slate-700 border border-slate-200/60 text-xs px-3 py-1.5 rounded-lg font-mono font-bold cursor-default hover:bg-slate-200 transition-colors"
                  >
                    &#123;&#123;{v}&#125;&#125;
                  </code>
                ))}
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">موضوع الرسالة (Subject)</label>
              {editing ? (
                <input 
                  type="text" 
                  value={editData.subject} 
                  onChange={e => setEditData({ ...editData, subject: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-mono font-bold text-slate-700" 
                />
              ) : (
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-3.5 text-sm text-slate-700 font-mono font-bold">
                  {selected.subject}
                </div>
              )}
            </div>

            {/* Body Input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-bold text-slate-700 mb-2">محتوى الرسالة (HTML Body)</label>
              {preview ? (
                <div 
                  className="border border-slate-200 rounded-2xl p-6 bg-white min-h-[300px] shadow-sm prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: editData.body }} 
                />
              ) : editing ? (
                <textarea
                  rows={14}
                  value={editData.body}
                  onChange={e => setEditData({ ...editData, body: e.target.value })}
                  className="w-full flex-1 bg-slate-900 border border-slate-800 text-emerald-400 rounded-2xl p-5 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all font-mono leading-relaxed"
                  dir="ltr"
                  spellCheck="false"
                />
              ) : (
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-900 shadow-sm min-h-[300px] overflow-auto">
                  <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed" dir="ltr">{selected.body}</pre>
                </div>
              )}
            </div>

            {!editing && !preview && (
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => showToast("تم إرسال رسالة تجريبية لبريدك الإلكتروني")} 
                  className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-6 rounded-2xl text-sm hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
                >
                  <Send className="w-4 h-4 text-primary-600" /> إرسال رسالة تجريبية (Test Email)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          {toastMsg}
        </div>
      )}
    </div>
  );
}
