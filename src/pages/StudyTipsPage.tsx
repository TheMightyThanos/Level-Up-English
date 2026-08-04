import { useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Target, Brain, Clock, ChevronRight, Lightbulb } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export default function StudyTipsPage() {
  useEffect(() => { document.title = "Study Materials & Tips — Level-Up English!"; }, []);

  return (
    <div className="flex-1 w-full flex justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-14 pb-16">

        {/* ═══════════ HERO HEADER ═══════════ */}
        <motion.div {...fadeUp(0.1)} className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-2 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <BookOpen className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Reading Comprehension{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              Strategies &amp; Tips
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            Mastering the TOEFL-style UMEPT requires more than just translating words. It requires strategic approaches across Listening, Structure, and Reading. Here are the key skills you need to develop.
          </p>
        </motion.div>

        {/* ═══════════ STRATEGIES ═══════════ */}
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Strategy 1 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white">1. Finding the Main Idea</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                The main idea is usually found in the first or last sentence of a paragraph. Don't read every single word—use <strong>Skimming</strong> to quickly grasp the overarching theme of the text before looking at the questions.
              </p>
            </div>
          </div>

          {/* Strategy 2 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">2. Guessing Vocabulary in Context</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                If you encounter an unfamiliar word, do not panic. Look at the surrounding words (context clues). Often, the sentence itself provides a synonym, antonym, or explanation of the difficult word.
              </p>
            </div>
          </div>

          {/* Strategy 3 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white">3. Making Inferences</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                Some questions ask for information that is not explicitly stated. You must draw a logical conclusion based on the facts provided. Read between the lines and look for implications.
              </p>
            </div>
          </div>

          {/* Strategy 4 */}
          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:bg-white/[0.04] transition-colors">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">4. Scanning for Specific Details</h3>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                When a question asks for a specific date, name, or fact, use <strong>Scanning</strong>. Move your eyes quickly over the text to spot the keyword mentioned in the question without reading everything else.
              </p>
            </div>
          </div>

        </motion.div>

        {/* ═══════════ RECOMMENDATIONS ═══════════ */}
        <motion.div {...fadeUp(0.3)} className="relative p-8 sm:p-12 rounded-[40px] border border-white/5 bg-white/[0.01]">
          <h2 className="text-2xl font-black text-white mb-6">General Test-Taking Advice</h2>
          <ul className="space-y-4">
            {[
              "Always answer every question. There is no penalty for guessing incorrectly on the UMEPT.",
              "Read the questions first before reading the entire passage. This gives your reading a purpose.",
              "Manage your time carefully. In Examination Mode, you have 115 minutes for 140 questions across all sections.",
              "Use the 'Flag' feature to mark difficult questions and return to them later if you have time remaining."
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-white/60 text-sm sm:text-base leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </div>
  );
}
