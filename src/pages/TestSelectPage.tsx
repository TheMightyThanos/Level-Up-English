import { useTest } from '@/context/TestContext';
import { getAvailableTests, PracticeTestInfo } from '@/data/test-registry';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Lock, FileText, Sparkles, CheckCircle2, Clock } from 'lucide-react';

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

export default function TestSelectPage() {
  const { state, dispatch } = useTest();
  const tests = getAvailableTests();

  const handleSelect = (test: PracticeTestInfo) => {
    if (!test.isAvailable) return;
    dispatch({ type: 'SET_SELECTED_TEST', payload: test.id });
    dispatch({ type: 'SET_VIEW', payload: 'mode-select' });
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

      <div className="max-w-4xl w-full relative z-10 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-4 sm:mb-6"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "hsl(267 84% 81%)" }}>
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Step 1 of 2
          </motion.div>
          
          <motion.h1 {...fadeUp(0.2)} className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 sm:mb-4">
            Select Practice <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, hsl(258 100% 82%), hsl(210 100% 78%))" }}>Test</span>
          </motion.h1>
          
          <motion.p {...fadeUp(0.3)} className="text-white/50 text-xs sm:text-sm md:text-base max-w-lg mx-auto">
            Welcome, <span className="text-white font-bold">{state.userData.name}</span>. Please choose the Level-Up English material you wish to practice today.
          </motion.p>
        </div>

        {/* Test Cards List */}
        <div className="w-full flex flex-col gap-3 sm:gap-4">
          {tests.map((test, idx) => {
            const isAvail = test.isAvailable;
            return (
              <motion.div
                key={test.id}
                {...fadeUp(0.4 + idx * 0.1)}
                onClick={() => handleSelect(test)}
                className={`group relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 transition-all duration-300 overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl ${
                  isAvail 
                    ? "cursor-pointer hover:bg-white/10 hover:border-violet-400/50 hover:shadow-2xl shadow-violet-500/20 hover:-translate-y-1" 
                    : "opacity-60 cursor-not-allowed grayscale-[0.3]"
                }`}
              >
                {/* Glow behind card (only if available) */}
                {isAvail && (
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 ${
                    isAvail
                      ? 'bg-gradient-to-br from-violet-500 to-indigo-600 group-hover:scale-105 group-hover:rotate-3'
                      : 'bg-white/10 border border-white/10'
                  }`}>
                    {isAvail ? (
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white/40" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 sm:mb-2">
                      <h3 className={`text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
                        isAvail ? "text-white group-hover:text-violet-200" : "text-white/60"
                      }`}>
                        {test.name}
                      </h3>
                      {isAvail ? (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/10 text-white/40 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-white/10">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    
                    <p className={`text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed ${isAvail ? "text-white/50" : "text-white/30"}`}>
                      {test.description}
                    </p>

                    {isAvail && (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-5 text-[10px] sm:text-xs">
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 bg-black/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-white/5">
                          <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                          <span className="font-medium">{test.questionCount.section1 + test.questionCount.section2 + test.questionCount.section3} Total Items</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 bg-black/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-white/5">
                          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                          <span className="font-medium">Est. 115 mins</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-400/80 bg-emerald-500/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="font-medium">Taxonomy Mapped</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Arrow Indicator */}
                  {isAvail && (
                    <div className="hidden md:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors shrink-0">
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  )}
                  
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Back Button */}
        <motion.div {...fadeUp(0.6)} className="mt-12 text-center">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'login' })}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to User Info
          </button>
        </motion.div>

      </div>
    </div>
  );
}
