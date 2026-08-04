import { Suspense } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "./Navbar";
import LoadingScreen from "@/components/ui/LoadingScreen";

export function RootLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#030014" }}>
      <Navbar />
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 flex flex-col"
          >
            <Suspense fallback={<LoadingScreen />}>
              {outlet}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
