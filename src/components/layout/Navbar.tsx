import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTest } from "@/context/TestContext";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Home, Info, UserRound, GraduationCap, BookOpen, HelpCircle, MessageSquare } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const { state } = useTest();
  const [hasUserSession, setHasUserSession] = useState(false);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setHasUserSession(Boolean(session));
      });
    }
  }, []);

  // Hide the navbar when the user is actively taking a test or on dashboard
  if ((location.pathname === "/" && state.view === "test") || location.pathname.startsWith("/test") || location.pathname === "/dashboard") {
    return null;
  }

  const homePath = hasUserSession ? "/dashboard" : "/";

  const links = [
    { name: "Home", path: homePath, icon: Home },
    { name: "About the App", path: "/about-app", icon: Info },
    { name: "Study Tips", path: "/study-tips", icon: BookOpen },
    { name: "FAQ", path: "/faq", icon: HelpCircle },
    { name: "Feedback", path: "/feedback", icon: MessageSquare },
    { name: "Researcher", path: "/about-researcher", icon: UserRound },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b border-white/10"
      style={{
        background: "linear-gradient(135deg, rgba(10,4,30,0.95) 0%, rgba(15,6,40,0.95) 100%)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to={homePath} className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-violet-500/30 bg-violet-500/10 group-hover:bg-violet-500/20 transition-all duration-300 group-hover:border-violet-400/50">
            <GraduationCap className="w-[18px] h-[18px] text-violet-300" />
          </div>
          <span className="font-bold text-white/90 tracking-wide text-sm hidden sm:block group-hover:text-white transition-colors">
            EPT Reading Prep
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "text-violet-300"
                    : "text-white/50 hover:text-white/90 hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${isActive ? "text-violet-400" : "text-white/30 group-hover:text-white/70"}`} />
                <span className="hidden sm:block">{link.name}</span>

                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-xl border border-violet-500/30 bg-violet-500/10 -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Active indicator line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)" }} />
    </motion.header>
  );
}
