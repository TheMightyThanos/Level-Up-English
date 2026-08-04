import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScleLXaVr8ZLj25xND4mwSSznvmFIWuT8_Y1UplM4uhWFuDQQ/formResponse";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const, delay },
});

export default function FeedbackPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", rating: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { document.title = "Feedback & Questionnaire — Level-Up English!"; }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.message || formData.rating === 0) {
      setError("Please fill out all fields and provide a rating.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error: dbError } = await supabase
        .from('feedback')
        .insert([{
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          message: formData.message
        }]);

      if (dbError) throw dbError;

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Supabase insert error:", err);
      setError(err.message || "Failed to submit feedback. Make sure the table exists.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex justify-center p-6 sm:p-12 relative z-10">
      <div className="w-full max-w-3xl space-y-10 pb-16">

        {/* Hero */}
        <motion.div {...fadeUp(0.1)} className="text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 mb-2 shadow-[0_0_30px_rgba(236,72,153,0.15)]">
            <MessageSquare className="w-8 h-8 text-pink-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Help Us Improve
          </h1>
          <p className="text-base text-white/60 font-medium max-w-xl mx-auto leading-relaxed">
            Your feedback is crucial for improving our platform. Please share your experience using Level-Up English.
          </p>
        </motion.div>

        {/* ── Google Form CTA ── */}
        <motion.div {...fadeUp(0.15)} className="relative">
          <div className="relative rounded-[28px] overflow-hidden border border-violet-500/30 bg-gradient-to-br from-violet-600/20 via-indigo-600/15 to-purple-600/10 backdrop-blur-md p-8 sm:p-10 text-center shadow-[0_0_60px_rgba(139,92,246,0.15)]">
            {/* Decorative glow */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold uppercase tracking-widest">
                <span className="animate-pulse w-2 h-2 rounded-full bg-violet-400 inline-block" />
                Field Trial — Active
              </div>

              <p className="text-base sm:text-lg text-white/70 font-medium max-w-lg mx-auto leading-relaxed">
                Your feedback is highly valuable. Please click the button below to submit your evaluation.
              </p>

              <a
                href={GOOGLE_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-white text-base sm:text-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.45)] active:scale-[0.98] transition-all duration-200 select-none"
              >
                <span>📝</span>
                Fill Out the Evaluation Form
                <ExternalLink className="w-5 h-5 opacity-80" />
              </a>

              <p className="text-xs text-white/30 font-medium pt-1">
                Opens in a new tab · Takes approximately 3–5 minutes
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div {...fadeUp(0.2)} className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent rounded-[32px] border border-white/5" />
          
          <div className="relative p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center space-y-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white">Thank You!</h2>
                  <p className="text-white/60 max-w-md mx-auto">
                    Your response has been recorded successfully. Your participation greatly helps us improve.
                  </p>
                  <button 
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: "", email: "", message: "", rating: 0 });
                    }}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm font-bold"
                  >
                    Submit Another Response
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-red-200">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                        placeholder="Email"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block">Rate Your Experience</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, rating: star }))}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                            formData.rating >= star 
                              ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 scale-110" 
                              : "bg-white/5 border-white/10 text-white/20 hover:bg-white/10"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Your Feedback</label>
                    <textarea 
                      value={formData.message}
                      onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all resize-none"
                      placeholder="What did you like? What could be improved?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                      isSubmitting ? "bg-pink-500/50 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Feedback
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
