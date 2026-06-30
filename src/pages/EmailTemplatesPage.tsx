import { useState, useRef } from "react";
import { Mail, Eye, Edit2, Save, X, FileText, Send, CheckCircle2, Type } from "lucide-react";
import { clsx } from "clsx";

const defaultTemplates = [
  {
    id: "invoice_new",
    name: "فاتورة جديدة للعميل",
    subject: "إشعار إصدار فاتورة ضريبية رقم {{invoice_number}} - {{company_name}}",
    body: `شريكنا العزيز {{customer_name}}،

تحية طيبة وبعد،

نيابة عن إدارة {{company_name}}، نتقدم لكم بخالص الشكر والتقدير لثقتكم المستمرة في خدماتنا.
نرفق لسيادتكم طيه الفاتورة الضريبية رقم {{invoice_number}} والصادرة بتاريخ {{invoice_date}}.

تفاصيل الفاتورة:
- إجمالي المستحق: {{total_amount}} {{currency}}
- تاريخ الاستحقاق: {{due_date}}

نرجو التكرم بالاطلاع وإجراء اللازم نحو التسوية قبل تاريخ الاستحقاق المذكور أعلاه لضمان استمرارية الخدمة بأعلى جودة.

في حال وجود أي استفسارات، فريقنا المالي متاح دائماً للرد على تساؤلاتكم.

وتفضلوا بقبول فائق الاحترام والتقدير،
الإدارة المالية
{{company_name}}`,
    variables: ["invoice_number", "customer_name", "invoice_date", "total_amount", "currency", "due_date", "company_name"],
  },
  {
    id: "invoice_reminder",
    name: "تذكير بسداد الفاتورة",
    subject: "تذكير ودي: استحقاق الفاتورة رقم {{invoice_number}} - {{company_name}}",
    body: `شريكنا العزيز {{customer_name}}،

تحية طيبة وبعد،

نأمل أن تكونوا بأفضل حال.
نود تذكيركم ودياً بأن الفاتورة رقم {{invoice_number}} والبالغ قيمتها {{amount_due}} {{currency}}، قد حان موعد استحقاقها بتاريخ {{due_date}}.

نظراً لأهمية تسوية الحسابات لضمان سلاسة العمليات المشتركة، نرجو التكرم بتوجيه الإدارة المختصة لديكم لإتمام عملية السداد في أقرب فرصة ممكنة.
إذا كنتم قد قمتم بالسداد بالفعل، نرجو تجاهل هذه الرسالة مع خالص شكرنا.

نحن نقدر عالياً التزامكم وشراكتكم المثمرة معنا.

مع خالص التحيات،
قسم التحصيل والمتابعة
{{company_name}}`,
    variables: ["customer_name", "invoice_number", "amount_due", "currency", "due_date", "company_name"],
  },
  {
    id: "payslip",
    name: "قسيمة راتب الموظف",
    subject: "إشعار إيداع راتب شهر {{period}} - إدارة الموارد البشرية",
    body: `الزميل العزيز {{employee_name}}،

تحية طيبة،

يسعدنا إبلاغكم بأنه قد تم إصدار قسيمة الراتب الخاصة بكم لشهر {{period}}. نود أن نعرب عن تقديرنا لجهودكم وتفانيكم في العمل خلال الفترة الماضية.

فيما يلي ملخص تفصيلي للمستحقات:
- الراتب الأساسي: {{basic_salary}} ج.م
- البدلات والمكافآت المستحقة: {{allowances}} ج.م
- الاستقطاعات والتأمينات: -{{deductions}} ج.م
----------------------------------------
الصافي المحول لحسابكم: {{net_salary}} ج.م

نرجو مراجعة التفاصيل، وفي حال وجود أي استفسار يرجى عدم التردد في التواصل مع قسم شؤون الموظفين.

مع تمنياتنا بدوام التميز والنجاح،
إدارة الموارد البشرية
{{company_name}}`,
    variables: ["period", "employee_name", "basic_salary", "allowances", "deductions", "net_salary", "company_name"],
  },
  {
    id: "daily_summary",
    name: "ملخص يومي للإدارة",
    subject: "التقرير المالي والإحصائي اليومي - {{date}} - {{company_name}}",
    body: `السادة أعضاء الإدارة العليا،

تحية طيبة،

نضع بين أيديكم الملخص المالي والتشغيلي المحدث لنهاية يوم العمل {{date}}، ليتسنى لسيادتكم متابعة الأداء المالي بدقة:

[ ملخص الأداء المالي ]
- حركة المبيعات (الفواتير الصادرة): {{invoices_issued}}
- التدفقات النقدية الداخلة (متحصلات): {{payments_received}} ج.م
- التدفقات النقدية الخارجة (مصروفات): {{expenses_recorded}} ج.م
----------------------------------------
- الرصيد النقدي الختامي المتاح: {{cash_balance}} ج.م

هذا التقرير مُصدر آلياً من النظام المحاسبي الموحد. للاطلاع على التقارير التحليلية المفصلة، يرجى تسجيل الدخول إلى لوحة القيادة (Dashboard).

مع تحيات،
النظام المحاسبي الآلي
{{company_name}}`,
    variables: ["date", "company_name", "invoices_issued", "payments_received", "expenses_recorded", "cash_balance"],
  },
];

const wrapWithHTML = (text: string) => {
  // Convert basic plain text to a beautiful HTML structure
  const htmlBody = text.replace(/\n/g, '<br/>');
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px 24px; text-align: center; border-bottom: 4px solid #34d399;">
        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">النظام المحاسبي الموحد</h1>
      </div>
      <div style="padding: 40px 32px; background-color: white; color: #334155; line-height: 1.8; font-size: 16px;">
        ${htmlBody}
      </div>
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 13px; font-weight: 500; border-top: 1px solid #e2e8f0;">
        هذه رسالة آلية تم إرسالها بواسطة نظام المحاسبة الذكي.
        <br/>
        &copy; ${new Date().getFullYear()} جميع الحقوق محفوظة.
      </div>
    </div>
  `;
};

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates);
  const [selected, setSelected] = useState(templates[0]);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ subject: selected.subject, body: selected.body });
  const [preview, setPreview] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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
    showToast("تم حفظ التعديلات على نص القالب بنجاح!");
  };

  const insertVariable = (variable: string) => {
    if (!editing) return;
    
    const text = editData.body;
    let start = text.length;
    let end = text.length;
    
    if (textAreaRef.current) {
      start = textAreaRef.current.selectionStart;
      end = textAreaRef.current.selectionEnd;
    }
    
    const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
    setEditData({ ...editData, body: newText });
    
    // Maintain focus and set cursor position after the inserted variable
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newCursorPos = start + variable.length + 4; // 4 for {{ }}
        textAreaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-2 h-full bg-emerald-500"></div>
        <div className="ps-2">
          <h2 className="font-black text-slate-800 text-2xl flex items-center gap-3">
            <Mail className="w-8 h-8 text-emerald-600" />
            تخصيص رسائل الإيميل
            <span className="text-slate-400 font-medium text-lg hidden sm:inline-block">/ Email Editor</span>
          </h2>
          <p className="text-slate-500 mt-2 font-medium">اكتب الرسائل كأنك تكتب إيميل عادي، والنظام سيتولى تحويلها لتصميم احترافي تلقائياً.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Templates Sidebar */}
        <div className="space-y-4 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 p-5 lg:h-[calc(100vh-13rem)] lg:overflow-y-auto">
          <h3 className="font-black text-slate-800 text-lg px-2 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" /> الرسائل المتاحة
          </h3>
          <div className="space-y-2">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelect(t)}
                className={clsx(
                  "w-full text-start p-4 rounded-2xl transition-all duration-300 flex items-center gap-3 font-bold",
                  selected.id === t.id
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100"
                    : "bg-transparent border border-transparent text-slate-600 hover:bg-slate-50 hover:border-slate-100"
                )}
              >
                <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors", selected.id === t.id ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                  <Mail className="w-4 h-4" />
                </div>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Main Area */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 group border-0 overflow-hidden flex flex-col lg:h-[calc(100vh-13rem)]">
          
          {/* Editor Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100/60 bg-white gap-4 shrink-0">
            <div>
              <h3 className="font-black text-slate-800 text-xl">{selected.name}</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">تعديل النص وسنقوم نحن بالتصميم</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPreview(!preview)} 
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border", 
                  preview ? "bg-slate-800 text-white shadow-lg border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <Eye className="w-4 h-4" /> {preview ? "العودة للمحرر" : "معاينة الشكل النهائي"}
              </button>
              
              {!editing && !preview && (
                <button 
                  onClick={() => setEditing(true)} 
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-2 border border-emerald-100"
                >
                  <Edit2 className="w-4 h-4" /> تعديل النص
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
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" /> حفظ التعديلات
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/30">
            
            {/* Variables Section */}
            {editing && !preview && (
              <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm animate-in slide-in-from-top-2">
                <span className="text-sm text-emerald-800 font-bold mb-3 block flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-500" /> الكلمات السحرية (اضغط للإضافة في النص):
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {selected.variables.map(v => (
                    <button 
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="bg-white text-emerald-700 border border-emerald-200 text-sm px-4 py-2 rounded-xl font-bold cursor-pointer hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm active:scale-95"
                      title="اضغط لإدراج هذه الكلمة في النص"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!editing && !preview && (
              <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <Type className="w-5 h-5 text-slate-500" />
                <p className="text-sm font-bold text-slate-600">اضغط على "تعديل النص" بالأعلى لتغيير محتوى الرسالة.</p>
              </div>
            )}

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الإيميل (Subject)</label>
              {editing && !preview ? (
                <input 
                  type="text" 
                  value={editData.subject} 
                  onChange={e => setEditData({ ...editData, subject: e.target.value })} 
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-bold text-slate-800 shadow-sm" 
                  placeholder="اكتب عنوان الإيميل هنا..."
                />
              ) : (
                <div className="bg-white border border-slate-100 shadow-sm rounded-2xl px-5 py-3.5 text-sm text-slate-800 font-bold">
                  {preview ? editData.subject : selected.subject}
                </div>
              )}
            </div>

            {/* Body Input */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-bold text-slate-700 mb-2">محتوى الرسالة (Text Body)</label>
              
              {preview ? (
                <div className="border border-slate-200 rounded-2xl p-6 bg-slate-200/50 min-h-[400px] shadow-inner flex items-center justify-center">
                  <div 
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: wrapWithHTML(editData.body) }} 
                  />
                </div>
              ) : editing ? (
                <textarea
                  ref={textAreaRef}
                  rows={14}
                  value={editData.body}
                  onChange={e => setEditData({ ...editData, body: e.target.value })}
                  className="w-full flex-1 bg-white border border-slate-200 text-slate-800 rounded-2xl p-6 text-base outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all leading-relaxed shadow-sm resize-none"
                  placeholder="اكتب رسالتك هنا بكل بساطة كأنك تكتب رسالة عادية..."
                />
              ) : (
                <div className="border border-slate-100 rounded-2xl p-6 bg-white shadow-sm min-h-[300px] overflow-auto">
                  <pre className="text-base text-slate-700 font-sans whitespace-pre-wrap leading-relaxed">{selected.body}</pre>
                </div>
              )}
            </div>

            {!editing && !preview && (
              <div className="pt-4 flex justify-end">
                <button 
                  onClick={() => showToast("تم إرسال رسالة تجريبية لبريدك الإلكتروني (تصميم احترافي)")} 
                  className="bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm hover:bg-slate-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> إرسال رسالة تجريبية
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
