import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, CheckCircle2, ChevronRight, Rocket, Shield, Target,
  Clock, Brain, Lightbulb, FileDown, Sparkles, GraduationCap, ListOrdered,
} from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export default function AboutAppPage() {
  useEffect(() => { document.title = "About the App — Level-Up English!"; }, []);

  return (
    <div className="flex-1 w-full flex justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
      <div className="w-full max-w-4xl space-y-14 pb-16">

        {/* ═══════════ HERO HEADER ═══════════ */}
        <motion.div {...fadeUp(0.1)} className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 mb-2 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
            <BookOpen className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            About Level-Up English:{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Full TOEFL Simulation
            </span>
          </h1>
          <p className="text-base sm:text-lg text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            Welcome to the Level-Up English web-application. This tool is specifically designed to help you prepare for the{" "}
            <span className="text-violet-300 font-bold">TOEFL</span>{" "}
            effectively and strategically.
          </p>
        </motion.div>

        {/* ═══════════ AUTONOMOUS LEARNING SECTION ═══════════ */}
        <motion.div {...fadeUp(0.15)} className="relative rounded-[32px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 border border-white/5 rounded-[32px]" />
          <div className="relative p-8 sm:p-10 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-7 h-7 text-indigo-400" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-black text-white">Fostering Autonomous Learning</h2>
              <p className="text-sm sm:text-base text-white/55 leading-relaxed font-medium">
                Unlike traditional paper-based practice, this web-application is built on the core principle of{" "}
                <span className="text-violet-300 font-bold">fostering autonomous learning</span>. It empowers you to take full control of your own preparation journey. By providing accessible materials, instant feedback, and diagnostic tools, this web-application allows you to independently initiate your practice schedule, monitor your real-time performance, and critically evaluate your reading skills without relying on constant teacher supervision.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════ KEY FEATURES ═══════════ */}
        <motion.div {...fadeUp(0.2)} className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent rounded-[40px] border border-white/5" />
          <div className="relative p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Key Features</h2>
              </div>
            </div>
            <p className="text-sm sm:text-base text-white/50 font-medium mb-10 pl-0 sm:pl-16">
              This application is designed to simulate the authentic TOEFL experience while providing formative support.
            </p>

            {/* Feature Cards */}
            <div className="space-y-6">

              {/* 1. Dual-Mode Practice */}
              <div className="group flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/15 transition-colors">
                  <Clock className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    Dual-Mode Practice
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    You have the freedom to choose your learning method. Select{" "}
                    <span className="text-violet-300 font-semibold">Examination Mode</span>{" "}
                    for a strict, 115-minute countdown simulation to build your time-management skills under test pressure. Alternatively, select{" "}
                    <span className="text-indigo-300 font-semibold">Study Mode</span>{" "}
                    for a relaxed, untimed session where you can focus deeply on understanding each section.
                  </p>
                </div>
              </div>

              {/* 2. Authentic Parallel Content */}
              <div className="group flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/15 transition-colors">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    Authentic Parallel Content
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Engage with <span className="text-white/80 font-semibold">140 test items across Listening, Structure, and Reading sections</span>. These items are carefully constructed to mirror the exact rhetorical structures and cognitive demands of the authentic TOEFL.
                  </p>
                </div>
              </div>

              {/* 3. Automated Scoring & Diagnostic Feedback */}
              <div className="group flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/15 transition-colors">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    Automated Scoring &amp; Diagnostic Feedback
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    The moment you finish a session, the system automatically calculates your raw score out of 140. You will receive immediate, per-question explanations for any incorrect answers.
                  </p>
                </div>
              </div>

              {/* 4. Skill-Based Breakdown */}
              <div className="group flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors">
                  <Brain className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    Skill-Based Breakdown
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Your results are mapped directly to{" "}
                    <span className="text-blue-300 font-semibold">Brown &amp; Abeywickrama's taxonomy</span>{" "}
                    of reading skills for the reading section. The diagnostic chart will specifically identify your strengths and weaknesses in reading comprehension. You can use this data to smartly prioritize what to study next.
                  </p>
                </div>
              </div>

              {/* 5. Downloadable PDF Report */}
              <div className="group flex gap-5 sm:gap-6 p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/[0.03] to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                  <FileDown className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    Downloadable PDF Report
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-[10px] font-black uppercase tracking-wider text-emerald-400">New</span>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Upon completing a session in{" "}
                    <span className="text-emerald-300 font-semibold">Examination Mode</span>, you can easily download a comprehensive PDF report of your performance. This document includes your overall score, the detailed skill-breakdown chart, and a full review of your answers, allowing you to archive your results and track your improvement over time offline.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

        {/* ═══════════ HOW TO USE ═══════════ */}
        <motion.div {...fadeUp(0.25)} className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-[40px] border border-white/5" />
          <div className="relative p-8 sm:p-12">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                <ListOrdered className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">How to Use This Web-Application</h2>
                <p className="text-sm text-white/50 font-medium mt-1">Follow these steps to complete your practice session</p>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { step: "01", title: "Obtain Your Access Token", desc: "Before the session begins, you will receive a unique access token from the admin. This token is required to authenticate and begin your practice." },
                { step: "02", title: "Sign In & Complete Your Details", desc: "On the Home page, enter your access token along with your full name, email address, and WhatsApp number. Read and check the data consent agreement, then click \"Start Practice Session\"." },
                { step: "03", title: "Choose Your Test Mode", desc: "Select Examination Mode for a timed, 115-minute simulation that mirrors the real TOEFL pressure. Or select Study Mode for a relaxed, untimed session where you can focus on learning at your own pace." },
                { step: "04", title: "Take the Test", desc: "Answer all 140 test questions. You can flag any question to review it later before submitting. Navigate between questions using the panel on the side." },
                { step: "05", title: "Review Your Results & Download Report", desc: "After submitting, instantly view your score, per-question explanations, and skill-based diagnostic breakdown. In Examination Mode, you can also download your full results as a PDF for offline tracking." },
              ].map((item, i) => (
                <div key={i} className="flex gap-6 relative group">
                  {i !== 4 && (
                    <div className="absolute left-[1.15rem] top-12 bottom-[-2rem] w-px bg-gradient-to-b from-white/10 to-transparent group-hover:from-indigo-500/30 transition-colors" />
                  )}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white/40 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-all">
                    {item.step}
                  </div>
                  <div className="pt-1.5 pb-4">
                    <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                      {item.title}
                      <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed max-w-xl">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════ CTA FOOTER ═══════════ */}
        <motion.div {...fadeUp(0.3)} className="text-center pb-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <p className="text-sm sm:text-base font-bold text-violet-300">
              Take charge of your preparation, evaluate your progress, and elevate your reading comprehension skills today!
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
