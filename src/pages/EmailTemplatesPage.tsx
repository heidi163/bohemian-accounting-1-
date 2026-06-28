import { useState } from "react";
import { Mail, Eye, Edit2, Save, X, Plus, FileText } from "lucide-react";
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
    showToast("تم حفظ التعديلات على القالب بنجاح! ");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 text-2xl flex items-center gap-2">
          <Mail className="w-7 h-7 text-primary-600" /> قوالب البريد الإلكتروني (Email Templates)
        </h2>
        <p className="text-slate-500 mt-1 text-sm">تخصيص رسائل البريد الإلكتروني المرسلة تلقائياً من النظام. المتغيرات المحاطة بـ <code className="bg-slate-100 px-1 rounded text-primary-600">&#123;&#123;variable&#125;&#125;</code> تُستبدل بالبيانات الفعلية عند الإرسال.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template List */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-700 text-sm px-2">القوالب المتاحة</h3>
          {templates.map(t => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className={clsx(
                "w-full text-right p-3 rounded-xl border transition flex items-center gap-2 text-sm",
                selected.id === t.id
                  ? "bg-primary-50 border-primary-200 text-primary-800 font-bold"
                  : "bg-white border-slate-200 text-slate-600 hover:border-primary-200 hover:bg-slate-50"
              )}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {t.name}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">{selected.name}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreview(!preview)} className={clsx("px-3 py-1.5 rounded-lg text-sm font-bold border transition", preview ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-600 border-slate-200 hover:border-primary-300")}>
                <Eye className="w-4 h-4 inline ms-1" />{preview ? "تعديل" : "معاينة"}
              </button>
              {!editing && !preview && (
                <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-lg text-sm font-bold border border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100 transition">
                  <Edit2 className="w-4 h-4 inline ms-1" />تعديل
                </button>
              )}
              {editing && (
                <>
                  <button onClick={() => { setEditing(false); setEditData({ subject: selected.subject, body: selected.body }); }} className="px-3 py-1.5 rounded-lg text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition">
                    <X className="w-4 h-4 inline ms-1" />إلغاء
                  </button>
                  <button onClick={handleSave} className="px-3 py-1.5 rounded-lg text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition">
                    <Save className="w-4 h-4 inline ms-1" />حفظ
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Variables */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 font-bold">المتغيرات المتاحة:</span>
              {selected.variables.map(v => (
                <code key={v} className="bg-primary-50 text-primary-600 border border-primary-100 text-xs px-2 py-0.5 rounded-lg font-mono">&#123;&#123;{v}&#125;&#125;</code>
              ))}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">موضوع الرسالة (Subject)</label>
              {editing ? (
                <input type="text" value={editData.subject} onChange={e => setEditData({ ...editData, subject: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary-400" />
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-mono">{selected.subject}</div>
              )}
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">محتوى الرسالة (Body HTML)</label>
              {preview ? (
                <div className="border border-slate-200 rounded-xl p-4 bg-white min-h-[200px]" dangerouslySetInnerHTML={{ __html: editData.body }} />
              ) : editing ? (
                <textarea
                  rows={12}
                  value={editData.body}
                  onChange={e => setEditData({ ...editData, body: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 font-mono"
                  dir="ltr"
                />
              ) : (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 min-h-[200px]">
                  <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap overflow-auto">{selected.body}</pre>
                </div>
              )}
            </div>

            {!editing && !preview && (
              <div className="pt-2">
                <button onClick={() => showToast("تم إرسال رسالة تجريبية لبريدك الإلكتروني ")} className="bg-slate-100 text-slate-700 font-bold py-2 px-5 rounded-xl text-sm hover:bg-slate-200 transition flex items-center gap-2">
                  <Mail className="w-4 h-4" /> إرسال تجريبي (Test Email)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-10 start-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-[9999] whitespace-nowrap flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
