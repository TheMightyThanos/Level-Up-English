import { useState, useEffect, useRef } from 'react';
import { useTest } from '@/context/TestContext';
import { getPerformanceCategory, generateRecommendations, MICROSKILL_TO_MACROSKILL } from '@/data/scoring';
import { motion } from 'framer-motion';
import {
  Download, RotateCcw, Trophy, AlertTriangle, Lightbulb, CheckCircle, XCircle,
  Target, Loader2, TrendingUp, BookOpen, Clock, Percent, GraduationCap, ExternalLink,
} from 'lucide-react';
import { submitResultsToSupabase } from '@/services/supabaseSubmission';
import { downloadResultsPDF } from '@/services/pdfGenerator';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScleLXaVr8ZLj25xND4mwSSznvmFIWuT8_Y1UplM4uhWFuDQQ/formResponse';

/* ─── animation presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

/* ─── Floating orb — CSS animation for scroll performance ─── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-[90px] pointer-events-none ${className}`}
      style={{
        animation: `orb-pulse ${10 + delay}s ease-in-out ${delay}s infinite`,
        willChange: 'transform, opacity',
      }}
    />
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function ResultsPage() {
  const { state, dispatch } = useTest();
  const results = state.results;
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  const runSubmission = () => {
    if (!results) return;
    setSubmitStatus('loading');
    submitResultsToSupabase(state.userData, results)
      .then((result) => {
        if (result.success) setSubmitStatus('success');
        else { setSubmitStatus('error'); setSubmitError(result.error || 'Failed to submit'); }
      })
      .catch((err) => {
        console.error('[Results] submission failed:', err);
        setSubmitStatus('error');
        setSubmitError('Network error');
      });
  };

  useEffect(() => {
    if (!results || !state.userData.name || hasSubmitted.current || state.mode === 'study') return;
    hasSubmitted.current = true;
    runSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, state.userData, state.mode]);

  useEffect(() => {
    if (!results) {
      dispatch({ type: 'RESET' });
    }
  }, [results, dispatch]);

  if (!results) return null;

  const performance = getPerformanceCategory(results.percentage);
  const recommendations = generateRecommendations(results.analysis);

  // Use tailored gradients based on performance tone
  const perfColorMap: Record<string, string> = {
    green: 'from-emerald-400 to-teal-500 text-emerald-50 border-emerald-400/30 shadow-emerald-500/20',
    blue: 'from-blue-400 to-indigo-500 text-blue-50 border-blue-400/30 shadow-blue-500/20',
    indigo: 'from-violet-500 to-indigo-600 text-violet-50 border-violet-400/30 shadow-violet-500/20',
    yellow: 'from-amber-400 to-orange-500 text-amber-50 border-amber-400/30 shadow-amber-500/20',
    red: 'from-rose-500 to-red-600 text-rose-50 border-rose-400/30 shadow-rose-500/20',
  };



  const completedAt = new Date();
  const dateStr = completedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div
      className="min-h-screen relative pb-20"
      style={{ background: "linear-gradient(145deg, hsl(238 45% 8%) 0%, hsl(250 40% 11%) 40%, hsl(268 35% 10%) 100%)" }}
    >
      {/* ── Background Effects ── */}
      <Orb className="w-[800px] h-[800px] -top-60 -left-60 bg-violet-600" delay={0} />
      <Orb className="w-[600px] h-[600px] top-40 -right-40 bg-indigo-500" delay={2} />
      <Orb className="w-[700px] h-[700px] bottom-0 left-20 bg-emerald-600/30" delay={4} />
      
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20">
        
        {/* Header Section */}
        <motion.div {...fadeUp(0.1)} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-violet-300 text-xs font-bold uppercase tracking-[0.15em] mb-6">
            <BookOpen className="w-3.5 h-3.5" />
            Session Complete
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              {results.section3.raw}
            </span>
            <span className="text-white/30 text-3xl sm:text-5xl">/{results.section3.total}</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="text-white/60 text-sm font-medium">{state.userData.name} ({state.userData.email})</div>
            <div className="hidden sm:block text-white/20">•</div>
            <div className="text-white/60 text-sm font-medium">{dateStr}</div>
          </div>

          <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold border-2 bg-gradient-to-r ${perfColorMap[performance.color] || perfColorMap.indigo}`}>
            {performance.level} — {performance.message}
          </div>
        </motion.div>

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { icon: Percent, label: 'Accuracy', value: `${results.percentage}%`, sub: `${results.section3.raw} of ${results.section3.total} correct`, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { icon: GraduationCap, label: 'EPT Scaled Score', value: results.section3.scaled, sub: 'Scale 31 – 67', color: 'text-violet-400', bg: 'bg-violet-400/10' },
            { icon: Clock, label: 'Time Elapsed', value: formatElapsed(results.completionSeconds), sub: 'Out of 55 mins', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          ].map((kpi, i) => (
            <motion.div key={i} {...fadeUp(0.2 + i * 0.1)} className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                <kpi.icon className={`w-20 h-20 ${kpi.color}`} />
              </div>
              <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-4 relative z-10`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] mb-1 relative z-10">{kpi.label}</div>
              <div className="text-3xl font-black text-white mb-1 relative z-10">{kpi.value}</div>
              <div className="text-xs text-white/40 font-medium relative z-10">{kpi.sub}</div>
            </motion.div>
          ))}
        </div>



        {/* Wrong Answers */}
        {results.analysis.wrongQuestions.length > 0 ? (
          <motion.div {...fadeUp(0.9)} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-10">
            <div className="flex items-center gap-3 mb-6">
              <XCircle className="w-6 h-6 text-rose-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Review Mistakes ({results.analysis.wrongQuestions.length})</h2>
            </div>
            <div className="space-y-4">
              {results.analysis.wrongQuestions.map((item, idx) => (
                <div key={idx} className="bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-white text-sm">
                      {item.number}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider">Question</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p
                      className="dark-surface-question text-sm font-medium text-white/90 mb-5 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.question }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Your Answer</span>
                        </div>
                        <div className="text-sm text-rose-200/80 font-medium">{item.userAnswer}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Correct Answer</span>
                        </div>
                        <div className="text-sm text-emerald-200/80 font-medium">{item.correctAnswer}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div {...fadeUp(0.9)} className="p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-10 text-center">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(52,211,153,0.3)] border border-emerald-500/30">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Flawless Performance!</h2>
            <p className="text-white/50">Outstanding — all your answers are perfectly correct! 🎉</p>
          </motion.div>
        )}

        {/* Actions Container */}
        <div className="flex flex-col items-center gap-4 mt-8 pb-16">
          {submitStatus === 'loading' && (
            <div className="px-6 py-3 bg-white/5 text-white/50 rounded-full flex items-center gap-2 text-sm font-medium border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin" /> Transmitting data securely...
            </div>
          )}
          {submitStatus === 'success' && (
            <div className="px-6 py-3 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center gap-2 text-sm font-medium border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" /> Assessment results saved successfully
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <div className="px-6 py-3 bg-rose-500/10 text-rose-400 rounded-full flex items-center gap-2 text-sm font-medium border border-rose-500/20">
                <XCircle className="w-4 h-4" /> {submitError}
              </div>
              <button onClick={runSubmission} className="px-6 py-2 bg-white/10 text-white font-semibold rounded-full hover:bg-white/20 transition flex items-center gap-2 text-xs uppercase tracking-wider">
                <RotateCcw className="w-3.5 h-3.5" /> Retry Sync
              </button>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <button
              onClick={() => downloadResultsPDF(state.userData, results)}
              className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center gap-2 text-sm"
            >
              <Download className="w-4 h-4" /> Download Report (PDF)
            </button>
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-sm border border-white/10"
            >
              <RotateCcw className="w-4 h-4" /> Start New Session
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-12 pt-6 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/40">Level-Up English &copy; 2026. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
