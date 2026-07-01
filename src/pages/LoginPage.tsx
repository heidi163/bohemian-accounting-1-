import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import apiClient from "../api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }
    setLoading(true);
    
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
      
      // Update global context if necessary or just redirect
      navigate("/");
    } catch (err: any) {
      // Fallback for Vercel / offline demo
      if (email === "admin@bohemiangeeks.com" && password === "Admin@12345") {
        localStorage.setItem("auth_token", "demo-token");
        localStorage.setItem("auth_user", JSON.stringify({ name: "أحمد صلاح", role: "Super Admin", email }));
        navigate("/");
      } else {
        const errorMessage = err.response?.data?.message || "بيانات الدخول غير صحيحة. حاول مرة أخرى.";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1F4E79 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4 shadow-lg shadow-primary-500/30">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">BGK & O2N</h1>
          <p className="text-slate-400 mt-1 text-sm">نظام المحاسبة المتكامل — Bohemian Accounting</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">تسجيل الدخول</h2>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2">
              <span className="text-rose-400 font-bold"></span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bohemiangeeks.com"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-primary-400 focus:bg-white/15 transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-slate-500 rounded-xl px-4 py-3 outline-none focus:border-primary-400 focus:bg-white/15 transition-all pe-12"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-slate-400">تذكرني</span>
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm text-primary-400 hover:text-primary-300 transition">
                نسيت كلمة المرور؟
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 mt-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري التحقق...</> : 'دخول إلى النظام'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">
              بيانات تجريبية: <span className="text-slate-400 font-mono">admin@bohemiangeeks.com</span> / <span className="text-slate-400 font-mono">Admin@12345</span>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 Bohemian Geeks & O2Nation — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
