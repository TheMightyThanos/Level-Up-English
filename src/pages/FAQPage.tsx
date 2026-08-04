import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Key, Clock, Zap, BookOpen } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

const FAQS = [
  {
    icon: Key,
    question: "How do I get an Access Token?",
    answer: "Access tokens are uniquely generated and distributed by the admin directly to the participants. Please contact the admin via WhatsApp or email to request your token before starting the session."
  },
  {
    icon: Clock,
    question: "What is the difference between Examination Mode and Study Mode?",
    answer: "Examination Mode simulates the real UMEPT environment with a strict 115-minute timer. If the time runs out, your answers are automatically submitted. Study Mode is untimed, allowing you to read at your own pace without pressure."
  },
  {
    icon: Zap,
    question: "What happens if my internet disconnects during the test?",
    answer: "The application currently requires a stable internet connection to submit your final results. If you disconnect, do not refresh the page. Try to reconnect your internet, then click submit once the connection is restored."
  },
  {
    icon: BookOpen,
    question: "How is the scoring calculated?",
    answer: "Your raw score is calculated out of 140 total questions. The diagnostic feedback maps your incorrect Reading answers to Brown & Abeywickrama's reading taxonomy, helping you identify specific skills you need to improve."
  }
];

function FAQItem({ faq, isOpen, onClick }: { faq: any, isOpen: boolean, onClick: () => void }) {
  const Icon = faq.icon;
  
  return (
    <div className="rounded-[24px] bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300">
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5 border border-white/10'}`}>
            <Icon className={`w-5 h-5 ${isOpen ? 'text-cyan-400' : 'text-white/40'}`} />
          </div>
          <h3 className="text-lg font-bold text-white pr-4">{faq.question}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/40 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 pl-[4.5rem] text-sm text-white/60 leading-relaxed font-medium">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => { document.title = "FAQ & Help — Level-Up English!"; }, []);

  return (
    <div className="flex-1 w-full flex justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
      <div className="w-full max-w-3xl space-y-12 pb-16">

        {/* Hero */}
        <motion.div {...fadeUp(0.1)} className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-2 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <HelpCircle className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-white/60 font-medium max-w-xl mx-auto leading-relaxed">
            Need help? Here are answers to the most common questions about the platform, test modes, and access tokens.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div {...fadeUp(0.2)} className="space-y-4">
          {FAQS.map((faq, index) => (
            <FAQItem 
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </motion.div>

      </div>
    </div>
  );
}
