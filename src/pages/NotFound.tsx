import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "404 — Page Not Found";
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6"
      >
        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
          404
        </h1>
        <p className="text-xl text-white/60 font-medium">
          Oops! Page not found
        </p>
        <p className="text-sm text-white/40 max-w-md mx-auto">
          The page <code className="text-violet-400 font-mono text-xs bg-white/5 px-2 py-1 rounded-lg">{location.pathname}</code> does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm font-bold text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Home className="w-4 h-4" />
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
