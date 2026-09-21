import { useTest } from '@/context/TestContext';
import { TestMode } from '@/types/toefl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Timer, BookOpen, Clock, Send, Infinity as InfinityIcon, Lightbulb, ShieldOff, ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { fetchTestDataFromSupabase } from '@/data/questions';

/* ─── animation presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

/* ─── Floating orb ─── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

const modeConfigs = {
  exam: {
    title: 'Examination Mode',
    icon: Timer,
    desc: 'Official testing environment with strict timing.',
    gradient: 'from-violet-500 to-indigo-600',
    shadow: 'shadow-indigo-500/25',
    borderHover: 'hover:border-indigo-400/50',
    features: [
      { icon: Clock, text: 'Strict 55-minute countdown timer' },
      { icon: Send, text: 'Results submitted to admin' },
      { icon: ShieldOff, text: 'No immediate diagnostic feedback' },
    ]
  },
  study: {
    title: 'Study Mode',
    icon: BookOpen,
    desc: 'Self-paced learning with comprehensive explanations.',
    gradient: 'from-emerald-400 to-teal-500',
    shadow: 'shadow-emerald-500/25',
    borderHover: 'hover:border-emerald-400/50',
    features: [
      { icon: InfinityIcon, text: 'Untimed, self-paced progression' },
      { icon: Lightbulb, text: 'Immediate per-question feedback' },
      { icon: CheckCircle2, text: 'Practice without submission' },
    ]
  }
};

export default function ModeSelectPage() {
  const { state, dispatch } = useTest();
  const [loading, setLoading] = useState(false);

  const handleSelectMode = async (mode: TestMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
    setLoading(true);
    try {
      const payload = await fetchTestDataFromSupabase(state.selectedTestId);
      dispatch({ type: 'START_TEST', payload });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'START_TEST' }); // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-6"
      style={{ background: "linear-gradient(145deg, hsl(238 45% 8%) 0%, hsl(250 40% 11%) 40%, hsl(268 35% 10%) 100%)" }}
    >
      {/* ── Animated aurora orbs ── */}
      <Orb className="w-[600px] h-[600px] -top-32 -left-32 bg-violet-600" delay={0} />
      <Orb className="w-[500px] h-[500px] -bottom-40 -right-20 bg-indigo-500" delay={2} />
      
      {/* ── Fine grid ── */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-5xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-4 sm:mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "hsl(267 84% 81%)" }}>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Step 2 of 2
          </motion.div>
          
          <motion.h1 {...fadeUp(0.2)} className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4">
            Select Practice <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, hsl(258 100% 82%), hsl(210 100% 78%))" }}>Mode</span>
          </motion.h1>
          
          <motion.p {...fadeUp(0.3)} className="text-white/50 text-xs sm:text-sm md:text-base max-w-lg mx-auto">
            Welcome, <span className="text-white font-bold">{state.userData.name}</span>. Please choose your preferred learning environment for this session.
          </motion.p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl">
          {(['exam', 'study'] as TestMode[]).map((mode, idx) => {
            const cfg = modeConfigs[mode];
            const Icon = cfg.icon;
            const isStudy = mode === 'study';
            return (
              <motion.div
                key={mode}
                {...fadeUp(0.4 + idx * 0.15)}
                onClick={() => (!isStudy && !loading) && handleSelectMode(mode)}
                className={`group relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl ${
                  isStudy ? 'opacity-50 cursor-not-allowed' : loading ? 'opacity-70 cursor-wait' : `cursor-pointer hover:bg-white/10 ${cfg.borderHover} hover:shadow-2xl ${cfg.shadow}`
                }`}
              >
                {/* Glow behind card */}
                {!isStudy && <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />}
                
                {/* Icon Header */}
                <div className="flex items-start justify-between mb-5 sm:mb-8">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center shadow-lg ${!isStudy && 'group-hover:scale-110'} transition-transform duration-300`}>
                    {loading && !isStudy ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" /> : <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
                  </div>
                  {!isStudy ? (
                    <div className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold text-white/70 uppercase tracking-widest">
                      Coming Soon
                    </div>
                  )}
                </div>

                {/* Text content */}
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 tracking-tight">{cfg.title}</h3>
                <p className="text-xs sm:text-sm text-white/50 mb-5 sm:mb-8 leading-relaxed h-auto sm:h-10">{cfg.desc}</p>

                {/* Features list */}
                <div className="space-y-2 sm:space-y-3">
                  {cfg.features.map((f, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-lg sm:rounded-xl bg-black/20 border border-white/5 ${!isStudy && 'group-hover:border-white/10'} transition-colors`}>
                      <f.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                      <span className="text-[11px] sm:text-[13px] font-medium text-white/80">{f.text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Back Button */}
        <motion.div {...fadeUp(0.7)} className="mt-12 text-center">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'test-select' })}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Tests
          </button>
        </motion.div>

      </div>
    </div>
  );
}
