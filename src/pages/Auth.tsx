import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [lampOn, setLampOn] = useState(false);
  const navigate = useNavigate();

  // Add ripple keyframe animation
  const rippleStyle = ``;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/");
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        navigate("/");
      } else {
        toast.success("Check your email to confirm your account!");
      }
    }
    setLoading(false);
  };

  const ambientColor = "hsl(145, 63%, 49%)";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <style>{rippleStyle}</style>

      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Floor Lamp */}
        <div className="flex flex-col items-center justify-end h-64 sm:h-80 lg:h-96 w-full lg:flex-1 lg:w-auto relative">
          {/* Light Cone - Steady when lamp is on */}
          {lampOn && (
            <div
              className="absolute top-32 lg:top-40 left-1/2 -translate-x-1/2 w-48 sm:w-56 lg:w-64 h-40 sm:h-44 lg:h-48 pointer-events-none"
              style={{
                background: `linear-gradient(to bottom, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0) 100%)`,
                clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)",
              }}
            />
          )}

          {/* Lamp Shade */}
          <motion.div
            className="w-24 sm:w-28 lg:w-32 h-16 sm:h-20 lg:h-24 bg-slate-700 relative z-10"
            style={{
              clipPath: "polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)",
            }}
          />

          {/* Bulb */}
          <motion.div
            className="w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 rounded-full bg-green-300 relative z-20 -mt-4 sm:-mt-5 lg:-mt-6"
            style={{
              boxShadow: lampOn ? `0 0 60px 40px ${ambientColor}dd` : "none",
            }}
          />

          {/* Pole */}
          <div className="w-1.5 sm:w-2 h-36 sm:h-40 lg:h-48 bg-gradient-to-b from-slate-700 to-gray-800 z-5" />

          {/* Base */}
          <motion.div
            className="w-28 sm:w-32 lg:w-40 h-3 sm:h-3.5 lg:h-4 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 shadow-2xl"
            whileHover={{ scale: 1.05 }}
          />

          {/* Rope with Pull Button - Extending from Lamp */}
          <motion.div
            className="absolute top-32 lg:top-40 left-1/2 -translate-x-1/2 flex flex-col items-center z-30 cursor-pointer"
            onClick={() => setLampOn(!lampOn)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Rope extending from bulb */}
            <motion.div
              className="w-0.5 bg-gray-600"
              animate={{ height: lampOn ? "40px" : "60px" }}
              transition={{ duration: 0.3 }}
            />

            {/* Pull Button Circle */}
            <motion.div
              animate={{
                backgroundColor: lampOn ? ambientColor : "#4b5563",
                boxShadow: lampOn ? `0 0 20px ${ambientColor}` : "0 2px 8px rgba(0, 0, 0, 0.5)",
              }}
              transition={{ duration: 0.5 }}
              className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border-2 border-gray-600"
            >
              <motion.div
                animate={{ scale: lampOn ? 1.2 : 1 }}
                className="w-2 h-2 rounded-full bg-gray-900"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-md lg:flex-1">
          {/* Title - Always Visible */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-400 text-sm">
              {isLogin
                ? "Sign in to access your AI-powered finance tools"
                : "Get started with FlashFinance AI"}
            </p>
          </motion.div>

          {/* Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: lampOn ? 1 : 0, y: lampOn ? 0 : 20 }}
            transition={{ duration: 0.5 }}
            className={`${
              !lampOn ? "pointer-events-none" : ""
            } bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 sm:p-6`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: lampOn ? 1 : 0, x: lampOn ? 0 : -20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="displayName" className="text-xs text-gray-300">
                    Display Name
                  </Label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <Input
                      id="displayName"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700/50 text-white text-xs sm:text-sm placeholder-gray-500"
                      required
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: lampOn ? 1 : 0, x: lampOn ? 0 : -20 }}
                transition={{ duration: 0.5, delay: isLogin ? 0.1 : 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-xs text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white text-xs sm:text-sm placeholder-gray-500"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: lampOn ? 1 : 0, x: lampOn ? 0 : -20 }}
                transition={{ duration: 0.5, delay: isLogin ? 0.2 : 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className="text-xs text-gray-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700/50 text-white text-xs sm:text-sm placeholder-gray-500"
                    minLength={6}
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: lampOn ? 1 : 0, x: lampOn ? 0 : -20 }}
                transition={{ duration: 0.5, delay: isLogin ? 0.3 : 0.4 }}
              >
                <Button
                  type="submit"
                  className="w-full gap-2 text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      {isLogin ? "Sign In" : "Sign Up"}
                      <ArrowRight size={14} />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: lampOn ? 1 : 0 }}
              transition={{ duration: 0.5, delay: isLogin ? 0.4 : 0.5 }}
              className="mt-6 text-center"
            >
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs sm:text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </motion.div>
          </motion.div>

          {/* Hint Text When Lamp is Off */}
          {!lampOn && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 text-xs sm:text-sm mt-8"
            >
              💡 Turn on the lamp to get started
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
