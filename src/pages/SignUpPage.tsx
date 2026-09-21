import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signUp } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ArrowRight, User, Hash, Mail,
  KeyRound, AtSign, Sparkles, BookOpen, Brain,
  Target, Clock, Shield, ChevronRight, LogIn,
  Eye, EyeOff,
} from "lucide-react";

/* ─── animation presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

/* ─── Stat card for hero panel ─── */
function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType; value: string; label: string; color: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-[18px] h-[18px] text-white" />
      </div>
      <div>
        <div className="text-sm font-black text-white leading-none">{value}</div>
        <div className="text-[10px] text-white/40 mt-0.5 leading-none">{label}</div>
      </div>
    </div>
  );
}

/* ─── Floating orb ─── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Floating particle ─── */
function Particle({ x, y, delay }: { x: string; y: string; delay: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-white/20"
      style={{ left: x, top: y }}
      animate={{ y: [0, -24, 0], opacity: [0, 0.6, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Field wrapper ─── */
function Field({ icon: Icon, label, hint, children }: {
  icon: React.ElementType; label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-900 uppercase tracking-[0.12em] mb-2">
        <Icon className="w-3 h-3 text-violet-500" />
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400/70 mt-1.5 pl-0.5">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 text-slate-800 placeholder:text-slate-400 text-[13px] font-semibold focus:outline-none focus:ring-[3px] focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all duration-300 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]";

/* ══════════════════════════════════════════════════════════════ */
export default function SignUpPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => { document.title = "Sign Up — Digitalized EPT Reading Preparation"; }, []);

  const [fullName, setFullName] = useState("");
  const [nim, setNim] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (fullName.trim().length < 3) errs.push("Full name must be at least 3 characters.");
    if (nim.trim().length < 5) errs.push("NIM must be at least 5 characters.");
    if (username.trim().length < 3) errs.push("Username must be at least 3 characters.");
    if (password.length < 6) errs.push("Password must be at least 6 characters.");

    // Institutional NIM validation — must start with "E1D0" (case-insensitive)
    if (!nim.trim().toUpperCase().startsWith("E1D0")) {
      errs.push("NIM harus berawalan E1D0.");
      toast({ variant: "destructive", title: "NIM Tidak Valid", description: "NIM harus berawalan E1D0 (contoh: E1D022118)." });
    }

    // Institutional email validation — must end with @student.unram.ac.id
    if (!email.trim().toLowerCase().endsWith("@student.unram.ac.id")) {
      errs.push("Gunakan email institusi @student.unram.ac.id.");
      toast({ variant: "destructive", title: "Email Tidak Valid", description: "Gunakan email institusi @student.unram.ac.id." });
    }

    if (errs.length > 0) { setErrors(errs); return; }

    setIsSubmitting(true);
    setErrors([]);

    const { error } = await signUp({
      email: email.trim(),
      password,
      username: username.trim(),
      fullName: fullName.trim(),
      nim: nim.trim(),
    });

    setIsSubmitting(false);

    if (error) {
      setErrors([error.message]);
      return;
    }

    toast({
      title: "Account Created!",
      description: "Your account has been registered successfully. Please log in.",
    });

    navigate("/login");
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#030014" }}
    >
      {/* ── Main layout row ── */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* ── Animated aurora orbs ── */}
        <Orb className="w-[800px] h-[800px] -top-[300px] -left-[200px] bg-violet-600/40" delay={0} />
        <Orb className="w-[600px] h-[600px] -bottom-[200px] -right-[100px] bg-indigo-500/30" delay={3} />
        <Orb className="w-[500px] h-[500px] top-1/4 left-1/3 bg-purple-500/20" delay={5} />

        {/* ── Abstract Glass Shapes ── */}
        <motion.div
          animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[40%] w-64 h-64 rounded-[40px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl hidden lg:block rotate-12"
        />
        <motion.div
          animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[15%] left-[10%] w-48 h-48 rounded-full border border-white/5 bg-gradient-to-tr from-violet-500/10 to-transparent backdrop-blur-2xl hidden lg:block"
        />

        {/* ── Fine grid & subtle noise ── */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.025] mix-blend-overlay pointer-events-none" />

        {/* ── Floating particles ── */}
        {[
          { x: "15%", y: "20%", d: 0 }, { x: "80%", y: "15%", d: 1.5 },
          { x: "25%", y: "75%", d: 0.8 }, { x: "70%", y: "65%", d: 2.2 },
          { x: "45%", y: "40%", d: 1.1 }, { x: "88%", y: "45%", d: 3 },
          { x: "10%", y: "55%", d: 2.7 }, { x: "60%", y: "85%", d: 0.4 },
        ].map((p, i) => <Particle key={i} x={p.x} y={p.y} delay={p.d} />)}

        {/* ══════════ LEFT — HERO PANEL ══════════ */}
        <div className="hidden lg:flex flex-col justify-between flex-1 p-16 xl:p-20 relative z-10">
          <div />

          <div className="max-w-xl">
            <motion.div {...fadeUp(0.2)} className="mb-6 inline-flex">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] relative overflow-hidden border border-violet-400/20 bg-violet-500/10 backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 animate-[shimmer_2s_infinite]" />
                <Sparkles className="w-3.5 h-3.5 text-violet-300" />
                <span className="text-violet-200">Create Your Account</span>
              </div>
            </motion.div>

            <motion.h1 {...fadeUp(0.3)} className="font-black text-white leading-[1.05] tracking-tight mb-8" style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}>
              Join{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text"
                  style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)" }}>
                  Digitalized EPT
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 h-[4px] rounded-full"
                  style={{ background: "linear-gradient(90deg, #8b5cf6, #6366f1)" }}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.9, duration: 0.8, ease: "circOut" }}
                />
              </span>{" "}
              Platform
            </motion.h1>

            <motion.p {...fadeUp(0.4)} className="text-base leading-relaxed max-w-md text-white/60 font-medium">
              Create your student account to access practice tests, diagnostic feedback, and prepare for the UMEPT.
            </motion.p>

            {/* Stat cards */}
            <motion.div {...fadeUp(0.5)} className="grid grid-cols-2 gap-4 mt-10">
              <StatCard icon={BookOpen} value="50 Items" label="Reading Comprehension" color="bg-violet-500/20 border-violet-500/30 text-violet-300" />
              <StatCard icon={Clock} value="55 Minutes" label="Exam Mode Timer" color="bg-indigo-500/20 border-indigo-500/30 text-indigo-300" />
              <StatCard icon={Brain} value="Brown's Taxonomy" label="Diagnostic Feedback" color="bg-purple-500/20 border-purple-500/30 text-purple-300" />
              <StatCard icon={Target} value="UMEPT-Ready" label="Test Preparation" color="bg-blue-500/20 border-blue-500/30 text-blue-300" />
            </motion.div>
          </div>

          {/* Bottom credit */}
          <motion.div {...fadeUp(0.65)} className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
            <p className="text-[13px] font-bold text-white/60">Muhammad Addinul Islam <span className="mx-2 text-white/20">|</span> E1D022118</p>
            <p className="text-[11px] text-white/40 font-medium">English Education Program · University of Mataram · 2026</p>
          </motion.div>
        </div>

        {/* ══════════ RIGHT — FORM PANEL ══════════ */}
        <div className="flex items-center justify-center w-full lg:w-[520px] xl:w-[580px] flex-shrink-0 p-5 sm:p-8 lg:p-12 relative z-20">
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px]"
          >
            {/* Mobile top bar */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(258 84% 60%), hsl(280 60% 55%))" }}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-bold text-white/80">Digitalized EPT Reading Preparation</span>
            </div>

            {/* ── Glass card ── */}
            <div
              className="rounded-[28px] overflow-hidden relative"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(250,249,255,0.95) 100%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.5) inset, 0 40px 100px -20px rgba(0,0,0,0.4), 0 0 80px -20px rgba(139,92,246,0.15)",
              }}
            >
              {/* ── Rainbow top strip ── */}
              <div className="h-[4px] w-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #c026d3, #0ea5e9, #10b981)" }} />

              {/* ── Card header ── */}
              <div className="px-8 pt-8 pb-6 border-b border-slate-100/80 bg-white/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[19px] font-black text-slate-800 tracking-tight">Create Account</h2>
                    <p className="text-[12px] text-slate-500 mt-1 font-medium">Register to start your EPT preparation journey.</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-violet-100/50 shadow-sm"
                    style={{ background: "linear-gradient(135deg, hsl(258 84% 97%), hsl(280 60% 95%))" }}>
                    <GraduationCap className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </div>

              <div className="px-8 py-7">

                {/* Error box */}
                <AnimatePresence>
                  {errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="p-4 rounded-2xl bg-red-50 border border-red-200 overflow-hidden"
                    >
                      <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">Registration Error</p>
                      {errors.map((e, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-xs text-red-500 font-medium">
                          <ChevronRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{e}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <motion.div {...fadeUp(0.2)}>
                    <Field icon={User} label="Full Name">
                      <input
                        type="text"
                        required
                        minLength={3}
                        className={inputClass}
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </Field>
                  </motion.div>

                  <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 gap-4">
                    <Field icon={Hash} label="NIM">
                      <input
                        type="text"
                        required
                        minLength={5}
                        className={inputClass}
                        placeholder="Student ID"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                      />
                    </Field>

                    <Field icon={AtSign} label="Username">
                      <input
                        type="text"
                        required
                        minLength={3}
                        className={inputClass}
                        placeholder="Choose username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </Field>
                  </motion.div>

                  <motion.div {...fadeUp(0.4)}>
                    <Field icon={Mail} label="Email (Unram)" hint="Use your university email if possible.">
                      <input
                        type="email"
                        required
                        className={inputClass}
                        placeholder="example@unram.ac.id"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </Field>
                  </motion.div>

                  <motion.div {...fadeUp(0.5)}>
                    <Field icon={KeyRound} label="Password" hint="Minimum 6 characters.">
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          className={`${inputClass} pr-11`}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors p-0.5"
                          tabIndex={-1}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </Field>
                  </motion.div>

                  {/* Submit */}
                  <motion.div {...fadeUp(0.6)} className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={!isSubmitting ? { scale: 1.015, y: -1 } : {}}
                      whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                      className={`w-full py-4 rounded-[14px] font-bold text-white text-[15px] flex items-center justify-center gap-2 relative overflow-hidden transition-all shadow-[0_8px_20px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_12px_24px_-8px_rgba(139,92,246,0.8)] ${isSubmitting ? 'opacity-80 cursor-not-allowed' : ''}`}
                      style={{
                        background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                      }}
                    >
                      <div className="absolute inset-0 rounded-[14px] border border-white/20 pointer-events-none" />
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)" }}
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                      />
                      <span className="relative z-10 flex items-center gap-2 tracking-wide">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account <ArrowRight className="w-4.5 h-4.5" />
                          </>
                        )}
                      </span>
                    </motion.button>
                  </motion.div>
                </form>
              </div>

              {/* Card footer */}
              <div className="px-8 py-4 flex items-center gap-2.5 border-t border-slate-200 bg-slate-50/80">
                <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-[11px] text-slate-600 font-medium">
                  Your data is securely encrypted and used solely for academic research.
                </p>
              </div>
            </div>

            {/* Below card — Login link */}
            <motion.div {...fadeUp(0.8)} className="text-center mt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 font-medium transition-colors duration-300"
              >
                <LogIn className="w-3.5 h-3.5" />
                Already have an account? <span className="text-violet-400 hover:text-violet-300 font-bold">Log in</span>
              </Link>
            </motion.div>

            <motion.p {...fadeUp(0.9)} className="text-center text-[10px] text-white/30 mt-4 leading-relaxed italic font-medium px-4">
              Content adapted from CLIFFS TOEFL Preparation Guide by Michael A. Pyle &amp; Mary Ellen Munoz Page.
              <br className="hidden sm:block" /> For research &amp; educational purposes only.
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
