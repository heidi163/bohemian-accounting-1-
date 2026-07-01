import { useState } from "react";
import { ShieldCheck, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("الرجاء إدخال بريدك الإلكتروني."); return; }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1F4E79 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4 shadow-lg shadow-primary-500/30">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">استعادة كلمة المرور</h1>
          <p className="text-slate-400 mt-1 text-sm">Bohemian Accounting System</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          {!sent ? (
            <>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                أدخل عنوان بريدك الإلكتروني المسجّل في النظام، وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
              </p>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3 mb-5">
                   {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-primary-400 transition-all"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</> : 'إرسال رابط الاستعادة'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 border border-primary-500/30 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white">تم الإرسال!</h3>
              <p className="text-slate-400 text-sm">
                تحقق من صندوق البريد الخاص بـ <span className="text-white font-mono">{email}</span>. قد يستغرق الأمر بضع دقائق.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white transition text-sm"
          >
            <ArrowRight className="w-4 h-4 " />
            العودة لتسجيل الدخول
          </button>
        </div>
      </div>
    </div>
  );
}
