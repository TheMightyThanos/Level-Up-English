import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTest } from "@/context/TestContext";
import { UserData } from "@/types/toefl";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ArrowRight, KeyRound,
  BookOpen, Shield, CheckCircle2, ChevronRight, User, Hash, Calendar,
  Sparkles, Brain, Target, Clock, X,
} from "lucide-react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScleLXaVr8ZLj25xND4mwSSznvmFIWuT8_Y1UplM4uhWFuDQQ/formResponse";

/* ─── animation presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

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
export default function LoginPage() {
  const { dispatch } = useTest();
  const navigate = useNavigate();
  useEffect(() => { document.title = "Level-Up English!"; }, []);
  const [formData, setFormData] = useState<UserData>({ name: "", email: "", phone: "", gender: "" });
  const [token, setToken] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isCheckingToken, setIsCheckingToken] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];

    if (formData.name.trim().length < 5) errs.push("Full name must be at least 5 characters.");
    if (!formData.email.includes("@")) errs.push("Please enter a valid email address.");
    if (formData.phone.trim().length < 9) errs.push("Please enter a valid phone number.");
    if (!consent) errs.push("Anda harus menyetujui persetujuan data.");

    if (errs.length > 0) { setErrors(errs); return; }

    setIsCheckingToken(true);
    setErrors([]); // Clear old errors

    // 1. Check Master Token Bypass
    const masterToken = import.meta.env.VITE_MASTER_TOKEN;
    const supervisorToken = import.meta.env.VITE_SUPERVISOR_TOKEN;
    let isValid = false;

    if (token && ((masterToken && token === masterToken) || (supervisorToken && token === supervisorToken))) {
      isValid = true;
    } else {
      // 2. Query Supabase for single-use token
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        const { data, error } = await supabase
          .from('access_tokens')
          .select('*')
          .eq('token', token)
          .single();

        if (error || !data) {
          errs.push("Invalid access token. Please verify your credentials or contact the test administrator.");
        } else if (data.is_used) {
          errs.push("This access token has expired or has already been used.");
        } else {
          // Valid single-use token: mark it as used
          const { error: updateError } = await supabase
            .from('access_tokens')
            .update({ is_used: true })
            .eq('token', token);

          if (updateError) {
            errs.push("Authentication service unavailable. Please check your connection and try again.");
          } else {
            isValid = true;
          }
        }
      } catch (err) {
        errs.push("Network error encountered during token validation. Please try again.");
      }
    }

    setIsCheckingToken(false);

    if (errs.length > 0 || !isValid) {
      setErrors(errs.length > 0 ? errs : ["Authentication failed. Please check your token."]);
      return;
    }

    dispatch({ type: "SET_USER_DATA", payload: formData });
    dispatch({ type: "SET_VIEW", payload: "test-select" });
    navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: "#030014" }} // Deep midnight space black
    >

      {/* ── Main layout row (orbs + hero + form) ── */}
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

        {/* Spacer — top bar removed */}
        <div />

        {/* Centre hero copy */}
        <div className="max-w-xl">
          <motion.div {...fadeUp(0.2)} className="mb-6 inline-flex">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] relative overflow-hidden border border-violet-400/20 bg-violet-500/10 backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 animate-[shimmer_2s_infinite]" />
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
              <span className="text-violet-200">Premium TOEFL Practice</span>
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.3)} className="font-black text-white leading-[1.05] tracking-tight mb-8" style={{ fontSize: "clamp(2.5rem,4.5vw,4rem)" }}>
            Level-Up{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)" }}>
                English!
              </span>
              <motion.span
                className="absolute -bottom-1 left-0 h-[4px] rounded-full"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #6366f1)" }}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.9, duration: 0.8, ease: "circOut" }}
              />
            </span>
          </motion.h1>

          <motion.p {...fadeUp(0.4)} className="text-base leading-relaxed max-w-md text-white/60 font-medium">
            A specialized web-based platform designed to foster autonomous learning. Featuring full TOEFL simulation including Listening, Structure, and Reading Comprehension sections, automated scoring, and diagnostic feedback to prepare you for the UMEPT.
          </motion.p>

          {/* Stat cards */}
          <motion.div {...fadeUp(0.5)} className="grid grid-cols-2 gap-4 mt-10">
            <StatCard icon={BookOpen} value="140 Items" label="Full TOEFL Simulation" color="bg-violet-500/20 border-violet-500/30 text-violet-300" />
            <StatCard icon={Clock} value="115 Minutes" label="Exam Mode Timer" color="bg-indigo-500/20 border-indigo-500/30 text-indigo-300" />
            <StatCard icon={Brain} value="Brown's Taxonomy" label="Diagnostic Feedback" color="bg-purple-500/20 border-purple-500/30 text-purple-300" />
            <StatCard icon={Target} value="UMEPT-Ready" label="Test Preparation" color="bg-blue-500/20 border-blue-500/30 text-blue-300" />
          </motion.div>
        </div>

        {/* Bottom credit */}
        <motion.div {...fadeUp(0.65)} className="space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <p className="text-[13px] font-bold text-white/60">Level-Up English Team <span className="mx-2 text-white/20">|</span> 2026</p>
          <p className="text-[11px] text-white/40 font-medium">Master the TOEFL with our curated simulations</p>
        </motion.div>
      </div>

      {/* ══════════ RIGHT — FORM PANEL ══════════ */}
      <div className="flex items-center justify-center w-full lg:w-[500px] xl:w-[560px] flex-shrink-0 p-5 sm:p-8 lg:p-12 relative z-20">
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
            <span className="text-sm font-bold text-white/80">Level-Up English!</span>
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
                  <h2 className="text-[19px] font-black text-slate-800 tracking-tight">Sign In to Platform</h2>
                  <p className="text-[12px] text-slate-500 mt-1 font-medium">Complete your details to begin the practice session.</p>
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
                    <p className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">Authentication Error</p>
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
                  {/* Access Token */}
                  <Field icon={KeyRound} label="Access Token" hint="Token provided by the researcher before the session.">
                    <div className="relative group">
                      <input
                        type="text"
                        required
                        className={`${inputClass} font-mono tracking-[0.22em] uppercase pr-10`}
                        placeholder="ENTER TOKEN"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                      />
                      <AnimatePresence>
                        {token.length >= 4 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2"
                          >
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Field>
                </motion.div>

                {/* Divider */}
                <motion.div {...fadeUp(0.3)} className="flex items-center gap-4 py-1.5">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Student Details</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </motion.div>

                <motion.div {...fadeUp(0.4)}>
                  {/* Full Name */}
                  <Field icon={User} label="Full Name">
                    <input
                      type="text"
                      required
                      minLength={5}
                      className={inputClass}
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Field>
                </motion.div>

                <motion.div {...fadeUp(0.5)} className="grid grid-cols-2 gap-4">
                  <Field icon={Hash} label="Email Address">
                    <input
                      type="email"
                      required
                      className={inputClass}
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    />
                  </Field>

                  <Field icon={Calendar} label="WhatsApp Number">
                    <input
                      type="tel"
                      required
                      className={inputClass}
                      placeholder="e.g. 0812..."
                      value={formData.phone}
                      onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </Field>
                </motion.div>

                {/* Consent */}
                <motion.div {...fadeUp(0.6)}>
                  <motion.label
                    whileTap={{ scale: 0.995 }}
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${consent
                      ? "border-violet-400 bg-violet-50/80 shadow-[0_4px_12px_rgba(139,92,246,0.1)]"
                      : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-violet-50/40"
                      }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-[4px] flex-shrink-0 border-2 flex items-center justify-center transition-all duration-300 ${consent ? "bg-violet-600 border-violet-600" : "border-slate-300 bg-white"
                      }`}>
                      <AnimatePresence>
                        {consent && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <input
                        type="checkbox"
                        id="consent"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="sr-only"
                      />
                    </div>
                    <div className="text-xs leading-relaxed">
                      <span className="font-bold text-slate-800 block mb-0.5 tracking-wide">Terms & Conditions</span>
                      <span className="text-slate-500 font-medium">
                        I agree to the terms and conditions and allow my test results to be evaluated by the{" "}
                        <span className="font-bold text-violet-600">Level-Up English</span>{" "}
                        system.
                      </span>
                    </div>
                  </motion.label>
                </motion.div>

                {/* Submit */}
                <motion.div {...fadeUp(0.7)} className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={isCheckingToken}
                    whileHover={!isCheckingToken ? { scale: 1.015, y: -1 } : {}}
                    whileTap={!isCheckingToken ? { scale: 0.98 } : {}}
                    className={`w-full py-4 rounded-[14px] font-bold text-white text-[15px] flex items-center justify-center gap-2 relative overflow-hidden transition-all shadow-[0_8px_20px_-8px_rgba(139,92,246,0.6)] hover:shadow-[0_12px_24px_-8px_rgba(139,92,246,0.8)] ${isCheckingToken ? 'opacity-80 cursor-not-allowed' : ''}`}
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    }}
                  >
                    {/* Inner highlight */}
                    <div className="absolute inset-0 rounded-[14px] border border-white/20 pointer-events-none" />

                    {/* Shine sweep */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)" }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                    />
                    <span className="relative z-10 flex items-center gap-2 tracking-wide">
                      {isCheckingToken ? (
                        <>
                          <div className="w-4 h-4 rounded-full border-[2.5px] border-white/30 border-t-white animate-spin" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          Start Practice Session <ArrowRight className="w-4.5 h-4.5" />
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
                Your data is securely encrypted and saved in our platform.
              </p>
            </div>
          </div>

          {/* Below card */}
          <motion.p {...fadeUp(0.9)} className="text-center text-[10px] text-white/30 mt-6 leading-relaxed italic font-medium px-4">
            Content adapted from CLIFFS TOEFL Preparation Guide by Michael A. Pyle &amp; Mary Ellen Munoz Page.
            <br className="hidden sm:block" /> For educational and practice purposes only.
          </motion.p>
        </motion.div>
      </div>
      {/* ── End main layout row ── */}
      </div>

    </div>
  );
}
