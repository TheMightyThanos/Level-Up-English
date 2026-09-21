import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTest } from '@/context/TestContext';
import { getPerformanceCategory, generateRecommendations, MICROSKILL_TO_MACROSKILL, sanitizeOptionText, cleanQuestionSentence } from '@/data/scoring';
import { motion } from 'framer-motion';
import {
  Download, RotateCcw, Trophy, AlertTriangle, Lightbulb, CheckCircle, XCircle,
  Target, Loader2, TrendingUp, BookOpen, Clock, Percent, GraduationCap, ExternalLink, Home,
} from 'lucide-react';
import { submitReadingResults } from '@/services/googleAppsScript';
import { downloadResultsPDF } from '@/services/pdfGenerator';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

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
  const navigate = useNavigate();
  const results = state.results;
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const hasSubmitted = useRef(false);

  const runSubmission = async () => {
    if (!results || !state.testData) return;
    setSubmitStatus('loading');

    // Determine the score to save for the leaderboard
    const allQs = [
      ...(state.testData?.section1?.questions || []),
      ...(state.testData?.section2?.questions || []),
      ...(state.testData?.section3?.questions || []),
    ];
    const totalQsLen = allQs.length > 0
      ? allQs.length
      : (results.section1.total + results.section2.total + results.section3.total);
    const isFullSim = results.section1.total > 0 || totalQsLen > 50;
    
    // Using totalScore which maps to EPT score for full sim, and percentage for reading-only
    const finalScore = results.totalScore;

    try {
      // 1. Submit to Google Apps Script (original logic)
      const gsResult = await submitReadingResults(
        state.selectedTestId,
        state.userData,
        state.testData,
        state.userAnswers.section3,
        results
      );

      if (!gsResult.success) {
        setSubmitStatus('error');
        setSubmitError(gsResult.error || 'Failed to submit to GAS');
        return;
      }

      // 2. Submit to Supabase `exam_results` for Leaderboard
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: dbError } = await supabase
          .from('exam_results')
          .insert({
            user_id: user.id,
            package_id: state.selectedTestId,
            score: Math.round(finalScore)
          });
        
        if (dbError) {
          console.error('[Results] Supabase submission failed:', dbError);
          // We can still consider the test finished even if leaderboard update fails
        }
      }
      
      setSubmitStatus('success');
    } catch (err) {
      console.error('[Results] submission error:', err);
      setSubmitStatus('error');
      setSubmitError('Network error');
    }
  };

  useEffect(() => {
    if (!results || !state.userData.name || hasSubmitted.current || state.mode === 'study') return;
    hasSubmitted.current = true;
    runSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, state.userData, state.mode]);

  const handleBackToDashboard = () => {
    dispatch({ type: 'RESET_TEST' });
    navigate('/dashboard');
  };

  const handleRetakeTest = () => {
    dispatch({ type: 'RESET_TEST' });
    dispatch({ type: 'SET_VIEW', payload: 'mode-select' });
    navigate('/test');
  };

  useEffect(() => {
    if (!results) {
      dispatch({ type: 'RESET_TEST' });
      navigate('/dashboard');
    }
  }, [results, dispatch, navigate]);

  if (!results) return null;

  // ── Calculate dynamic total items and test mode ──
  const allQuestions = [
    ...(state.testData?.section1?.questions || []),
    ...(state.testData?.section2?.questions || []),
    ...(state.testData?.section3?.questions || []),
  ];
  const totalQuestionsLength = allQuestions.length > 0
    ? allQuestions.length
    : (results.section1.total + results.section2.total + results.section3.total);

  const isFullSimulation = results.section1.total > 0 || totalQuestionsLength > 50;

  const isReadingOnlyPackage = Boolean(
    !isFullSimulation &&
    (state.selectedTestId === 'mock-skripsi' ||
      state.selectedTestId === 'practice-test-1' ||
      state.selectedTestId?.includes('skripsi') ||
      state.selectedTestId?.includes('reading-50') ||
      totalQuestionsLength <= 50)
  );

  const totalRawCorrect = isFullSimulation
    ? (results.section1.raw + results.section2.raw + results.section3.raw)
    : results.section3.raw;

  const displayDenominator = totalQuestionsLength || (isFullSimulation ? 140 : 50);

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

  const skillEntries = Object.entries(results.analysis.skillBreakdown)
    .sort((a, b) => (b[1].total - a[1].total));

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
            {isFullSimulation ? 'EPT Simulation Complete' : 'Reading Session Complete'}
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tight mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              {totalRawCorrect}
            </span>
            <span className="text-white/30 text-3xl sm:text-5xl">/{displayDenominator}</span>
          </h1>

          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/50 mb-6">
            {isFullSimulation ? 'Total Items Correct Across Full EPT Simulation' : 'Raw Reading Items Answered Correctly'}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <div className="text-white/60 text-sm font-medium">{state.userData.name} ({state.userData.nim})</div>
            <div className="hidden sm:block text-white/20">•</div>
            <div className="text-white/60 text-sm font-medium">{dateStr}</div>
          </div>

          <div className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold border-2 bg-gradient-to-r ${perfColorMap[performance.color] || perfColorMap.indigo}`}>
            {performance.level} — {performance.message}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className={`grid grid-cols-1 ${isFullSimulation ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'} gap-4 sm:gap-5 mb-10`}>
          {(isFullSimulation ? [
            { icon: Target, label: 'Listening Comprehension', value: `${results.section1.scaled}`, sub: `${results.section1.raw} / ${results.section1.total} raw items`, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { icon: Target, label: 'Structure & Written Expression', value: `${results.section2.scaled}`, sub: `${results.section2.raw} / ${results.section2.total} raw items`, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { icon: Target, label: 'Reading Comprehension', value: `${results.section3.scaled}`, sub: `${results.section3.raw} / ${results.section3.total} raw items`, color: 'text-rose-400', bg: 'bg-rose-400/10' },
            { icon: GraduationCap, label: 'Total UMEPT Score', value: `${results.totalScore}`, sub: `${totalRawCorrect} / ${displayDenominator} total items (~310–677)`, color: 'text-violet-400', bg: 'bg-violet-400/10' },
          ] : [
            { icon: Percent, label: 'Accuracy', value: `${results.percentage}%`, sub: `${results.section3.raw} of ${displayDenominator} correct`, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { icon: GraduationCap, label: 'EPT Scaled Score', value: `${results.section3.scaled}`, sub: 'Scale 31 – 67', color: 'text-violet-400', bg: 'bg-violet-400/10' },
            { icon: Clock, label: 'Time Elapsed', value: formatElapsed(results.completionSeconds), sub: 'Out of 55 mins', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
          ]).map((kpi, i) => (
            <motion.div key={i} {...fadeUp(0.2 + i * 0.1)} className="p-4 sm:p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                <kpi.icon className={`w-16 h-16 sm:w-20 sm:h-20 ${kpi.color}`} />
              </div>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3 sm:mb-4 relative z-10`}>
                <kpi.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${kpi.color}`} />
              </div>
              <div className="text-[10px] sm:text-[11px] font-bold text-white/50 uppercase tracking-[0.15em] mb-1 relative z-10">{kpi.label}</div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-1 relative z-10">{kpi.value}</div>
              <div className="text-[10px] sm:text-xs text-white/40 font-medium relative z-10">{kpi.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Skill Mastery Breakdown */}
        {isReadingOnlyPackage && skillEntries.length > 0 && (
          <motion.div {...fadeUp(0.5)} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-10">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-violet-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Taxonomy Analysis</h2>
            </div>
            <p className="text-sm text-white/50 mb-8">Detailed breakdown mapped to Brown's Taxonomy of reading microskills.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skillEntries.map(([skill, data], idx) => {
                const pct = (data.correct / data.total) * 100;
                const isLow = pct < 60;
                const isPriority = skill === 'Inference and Implied Meaning' && isLow;
                
                const barColor = pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-blue-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-500';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                    key={skill} 
                    className={`p-5 rounded-2xl border bg-black/20 ${isPriority ? 'border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'border-white/5 hover:border-white/10'} transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="pr-2">
                        <div className="font-bold text-white/90 text-sm mb-1">{skill}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-widest">
                          {MICROSKILL_TO_MACROSKILL[skill as keyof typeof MICROSKILL_TO_MACROSKILL] || 'Reading'}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-white text-base">{data.correct}/{data.total}</div>
                        <div className="text-[11px] text-white/50">{pct.toFixed(0)}%</div>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 rounded-full h-1.5 mt-4 mb-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.8 }}
                        className={`h-1.5 rounded-full ${barColor}`}
                      />
                    </div>

                    {isPriority && (
                      <div className="mt-3 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-rose-300 font-medium leading-relaxed">
                          Priority Area: Your MA12 (Inference) score is below 60%. Focus on reading between the lines.
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Field Trial Evaluation CTA ── */}
        <motion.div {...fadeUp(0.6)} className="mb-10">
          <div className="relative rounded-[28px] overflow-hidden border border-pink-500/30 bg-gradient-to-r from-pink-600/20 via-violet-600/15 to-indigo-600/20 backdrop-blur-md p-7 sm:p-9 shadow-[0_0_60px_rgba(236,72,153,0.15)]">
            {/* Decorative shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-violet-500/10 to-pink-500/0 pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-pink-500/15 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 text-center sm:text-left">
              <div className="flex-shrink-0 text-4xl sm:text-5xl select-none">🚀</div>
              <div className="flex-1 space-y-1.5">
                <p className="text-[11px] font-bold text-pink-300 uppercase tracking-[0.18em]">Research Evaluation</p>
                <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                  Help improve this platform!
                </h3>
                <p className="text-sm text-white/60 font-medium leading-relaxed">
                  Your insight directly shapes this thesis research. The survey only takes 3 minutes.
                </p>
              </div>
              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-white text-sm sm:text-base bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 hover:shadow-[0_0_25px_rgba(236,72,153,0.45)] active:scale-[0.98] transition-all duration-200 select-none whitespace-nowrap"
              >
                Evaluate this platform (Takes 3 mins) 🚀
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Tab Switch Warning */}
        {state.mode === 'exam' && state.tabSwitchCount > 0 && (
          <motion.div {...fadeUp(0.7)} className="mb-10 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-amber-500 mb-0.5">Integrity Warning</div>
              <div className="text-xs text-amber-500/70">
                You switched tabs or left the window <strong className="text-amber-400">{state.tabSwitchCount} time(s)</strong> during the examination.
              </div>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {isReadingOnlyPackage && recommendations.length > 0 && (
          <motion.div {...fadeUp(0.8)} className="p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md mb-10">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Strategic Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border flex gap-4 ${
                  rec.priority === 'critical' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-black/20 border-white/5'
                }`}>
                  <div className={`text-2xl font-black ${rec.priority === 'critical' ? 'text-rose-400' : 'text-emerald-400'} pt-1`}>
                    {rec.accuracy}%
                  </div>
                  <div>
                    <div className="font-bold text-white/90 text-sm mb-1">{rec.skill}</div>
                    <div className="text-xs text-white/60 leading-relaxed">{rec.message}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
                      <span className={`px-2 py-1 rounded ${
                        item.section === 'section1' ? 'bg-blue-500/20 text-blue-300' :
                        item.section === 'section2' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-violet-500/20 text-violet-300'
                      } text-[10px] font-bold uppercase tracking-wider`}>
                        {item.section === 'section1' ? 'Listening' : item.section === 'section2' ? 'Structure' : 'Reading'}
                      </span>
                      {item.skill && (
                        <span className="px-2 py-1 rounded bg-white/10 text-white/60 text-[10px] uppercase tracking-wider">{item.skill}</span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="dark-surface-question text-sm font-medium text-white/90 mb-5 leading-relaxed">
                      {cleanQuestionSentence(item.question)}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <div className="flex items-center gap-2 mb-2 text-rose-400">
                          <XCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Your Answer</span>
                        </div>
                        <div className="text-sm text-rose-200/80 font-medium">{sanitizeOptionText(item.userAnswer)}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Correct Answer</span>
                        </div>
                        <div className="text-sm text-emerald-200/80 font-medium">
                          {sanitizeOptionText(
                            item.correctAnswer && item.correctAnswer.toLowerCase() !== 'unknown'
                              ? item.correctAnswer
                              : 'Key unavailable'
                          )}
                        </div>
                      </div>
                    </div>
                    {item.explanation && (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-1.5 text-violet-400">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Explanation</span>
                        </div>
                        <div className="text-xs text-white/60 leading-relaxed">{item.explanation}</div>
                      </div>
                    )}
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
              onClick={handleRetakeTest}
              className="px-8 py-3.5 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2 text-sm border border-white/10"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </button>
            <Button
              variant="outline"
              onClick={handleBackToDashboard}
              className="px-8 py-6 h-auto bg-transparent border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 text-sm"
            >
              <Home className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-12 pt-6 border-t border-white/10 space-y-2">
          <p className="text-xs text-white/40">Data transmitted securely. Solely for authorized academic research.</p>
          <p className="text-xs text-white/40">Developed by <span className="font-semibold text-white/60">Muhammad Addinul Islam</span> — English Education Program, UNRAM</p>
        </div>
      </div>
    </div>
  );
}
