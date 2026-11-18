import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "#src/integrations/supabase/client";
import { toast } from "#src/components/ui/sonner";
import { Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "microsoft" | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      toast.error("Authentication service is not configured. Check environment variables.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message);
        } else if (data.session) {
          toast.success("Welcome back to FlashFinance!");
          navigate("/");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } else {
        if (!displayName.trim()) {
          toast.error("Please enter your name.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) {
          toast.error(error.message);
        } else if (data.user) {
          try {
            const { error: profileError } = await supabase.from("profiles").insert({
              id: data.user.id,
              display_name: displayName.trim(),
              created_at: new Date().toISOString(),
            });
            if (profileError) {
              console.warn("Profile creation warning:", profileError.message);
            }
          } catch (profileException) {
            console.warn("Profile creation exception:", profileException);
          }

          if (data.session) {
            toast.success("Account created successfully!");
            navigate("/");
          } else {
            toast.success("Account created! Check your email to confirm your account.");
          }
        } else {
          toast.error("Sign up failed. Please try again.");
        }
      }
    } catch (unexpectedError) {
      console.error("Auth error:", unexpectedError);
      toast.error("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "azure") => {
    if (!supabase) {
      toast.error("Authentication service is not configured.");
      return;
    }

    try {
      setSocialLoading(provider === "google" ? "google" : "microsoft");
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(`${provider === "google" ? "Google" : "Microsoft"} sign-in is not enabled in your Supabase project.`);
      }
    } catch (err) {
      console.error("OAuth error:", err);
      toast.error("Social sign-in failed. Please try email and password.");
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden selection:bg-emerald-100 selection:text-emerald-900">
      {/* Background gray faint square grids */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148, 163, 184, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
        }}
      />

      {/* Ambient background soft green glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px]" />

      {/* Main card grid container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 relative z-10 items-stretch"
      >
        {/* Left Card: Form */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-10 flex flex-col justify-between shadow-xl shadow-slate-200/60 relative">
          <div>
            {/* Brand Logo & Header */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 mb-4 bg-emerald-50/80 border border-emerald-200/60 px-3 py-1.5 rounded-full">
                <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center">
                  <Zap size={13} className="text-white" />
                </div>
                <span className="font-display font-bold text-xs tracking-tight text-slate-800">
                  Flash<span className="text-emerald-600">Finance</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                {isLogin ? "Sign in to FlashFinance" : "Create Finance account"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Start your experience with Finance by signing in or signing up.
              </p>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={!isLogin}
                    className="w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Primary Green CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span>{isLogin ? "Sign in" : "Sign up"}</span>
                )}
              </button>
            </form>

            {/* Social Logins */}
            <div className="mt-5 sm:mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={socialLoading !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {socialLoading === "google" ? (
                  <Loader2 size={15} className="animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin("azure")}
                disabled={socialLoading !== null}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {socialLoading === "microsoft" ? (
                  <Loader2 size={15} className="animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                )}
                <span>Continue with Microsoft</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-500">
            <p>
              By creating an account, you agree to our{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Privacy policy: FlashFinance safeguards your financial data.");
                }}
                className="text-slate-800 underline underline-offset-4 hover:text-emerald-600 transition-colors"
              >
                Privacy Policy
              </a>
            </p>

            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail("");
                setPassword("");
                setDisplayName("");
              }}
              className="mt-3 text-xs text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Right Card: Financial Visual Hub (White & Green Theme) */}
        <div className="bg-gradient-to-b from-white via-emerald-50/40 to-emerald-100/60 border border-emerald-200/80 rounded-3xl p-7 sm:p-10 flex flex-col justify-between shadow-xl shadow-slate-200/50 relative overflow-hidden min-h-[460px]">
          {/* Bottom green gradient aura */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-200/40 to-transparent pointer-events-none" />

          {/* Top floating visual cards */}
          <div className="relative z-10 w-full pt-2">
            {/* Top small card: Reinvestment rate */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full max-w-[280px] bg-white/95 backdrop-blur-md border border-emerald-100 rounded-2xl p-4 shadow-lg shadow-emerald-950/5 relative z-20"
            >
              <p className="text-[11px] text-slate-500 font-medium">Reinvestment rate</p>
              <p className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-0.5 tracking-tight">126.6%</p>

              {/* Mini wave chart */}
              <div className="mt-2 relative h-10 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40" fill="none">
                  <path
                    d="M 5,28 Q 25,35 45,22 T 85,26 T 125,12 T 165,18 T 195,6"
                    stroke="#10b981"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                  {/* Highlight point with pill */}
                  <circle cx="125" cy="12" r="3.5" fill="#059669" />
                  <circle cx="125" cy="12" r="7" fill="#10b981" opacity="0.25" />
                </svg>
                {/* 126.6% floating pill */}
                <div className="absolute top-[-10px] left-[55%] -translate-x-1/2 bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px] font-mono font-medium shadow-sm">
                  126.6%
                </div>
              </div>
            </motion.div>

            {/* Overlapping secondary chart card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="w-full max-w-[340px] ml-auto -mt-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 shadow-xl shadow-emerald-950/5 relative z-10"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                <span>30K</span>
                <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded text-[9px] font-medium shadow-xs">
                  2 June 12:00
                </span>
              </div>
              <div className="text-[10px] text-slate-400">20K</div>
              <div className="text-[10px] text-slate-400">10K</div>

              {/* Detailed multi-line chart */}
              <div className="relative h-14 w-full my-1">
                <svg className="w-full h-full" viewBox="0 0 260 55" fill="none">
                  {/* Subtle vertical marker line at June */}
                  <line x1="165" y1="0" x2="165" y2="55" stroke="rgba(100, 116, 139, 0.3)" strokeDasharray="2 2" />

                  {/* Primary smooth green wave */}
                  <path
                    d="M 5,30 Q 35,45 65,30 T 125,32 T 165,15 T 215,35 T 255,10"
                    stroke="#059669"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  {/* Secondary dashed wave */}
                  <path
                    d="M 5,20 Q 40,10 75,25 T 135,18 T 165,38 T 215,20 T 255,28"
                    stroke="#34d399"
                    strokeWidth="1.6"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Intersection dot */}
                  <circle cx="165" cy="15" r="3.5" fill="#059669" />
                </svg>
              </div>

              {/* Month ticks */}
              <div className="flex justify-between text-[8px] sm:text-[9px] text-slate-500 font-mono mt-1 border-t border-slate-100 pt-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span className="text-emerald-700 font-semibold">June</span>
                <span>July</span>
                <span>Aug</span>
                <span>Sept</span>
                <span>Oct</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Heading & Description */}
          <div className="relative z-10 pt-8 sm:pt-10 text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight leading-snug">
              A Unified Hub for Smarter Financial Decision-Making
            </h2>
            <p className="text-xs text-slate-600 mt-2.5 max-w-md mx-auto leading-relaxed">
              Finance empower you with a unified financial command centre—delivering deep insights and a 360 view of your entire economic world.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
