import { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, GraduationCap } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export default function AboutResearcherPage() {
  useEffect(() => { document.title = "About the Creator — Level-Up English!"; }, []);

  return (
    <div className="flex-1 w-full flex justify-center items-center p-6 sm:p-12 relative z-10 overflow-y-auto min-h-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative rounded-[40px] overflow-hidden shadow-2xl"
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(24px)" }}
      >
        {/* Header background abstract shapes */}
        <div className="h-48 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(258 84% 20%), hsl(285 65% 15%), hsl(240 60% 12%))" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
          <motion.div className="absolute top-4 right-4 w-32 h-32 rounded-full border border-white/10" animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full border border-white/10" animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} />
        </div>

        <div className="px-8 pb-12 -mt-20 text-center relative z-10">
          {/* Avatar */}
          <div className="relative inline-block group mb-6">
            <motion.div
              className="absolute -inset-4 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"
              style={{ background: "linear-gradient(135deg, hsl(258 84% 67%), hsl(285 60% 62%))" }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <img
              src="/images/adin.jpg"
              alt="Muhammad Addinul Islam"
              className="relative w-36 h-36 rounded-full object-cover border-[4px] border-[#030014] shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-emerald-500 border-[3px] border-[#030014] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <motion.div {...fadeUp(0.1)} className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Muhammad Addinul Islam</h2>
          </motion.div>

          <motion.div {...fadeUp(0.2)} className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
              <GraduationCap className="w-4 h-4" />
              Founder &amp; Lead Developer
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-white/5 text-white/70 border border-white/10">
              Level-Up English
            </span>
          </motion.div>
          
          <motion.p {...fadeUp(0.3)} className="mt-3 text-sm text-white/50 font-medium">Empowering students to achieve their best TOEFL scores.</motion.p>

          <motion.div {...fadeUp(0.5)} className="my-8 h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }} />

          <motion.div {...fadeUp(0.6)}>
            <a
              href="mailto:e1d022118@student.unram.ac.id"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-all shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.15)] group"
            >
              <Mail className="w-5 h-5 text-violet-400 group-hover:text-violet-300 transition-colors" />
              e1d022118@student.unram.ac.id
            </a>
          </motion.div>

          <motion.p {...fadeUp(0.7)} className="mt-8 text-xs leading-relaxed text-white/40 max-w-xl mx-auto font-medium">
            Level-Up English is a premium platform designed to provide an authentic and comprehensive TOEFL simulation experience. Test items are adapted from the CliffsTestPrep™ TOEFL® Preparation Guide.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
