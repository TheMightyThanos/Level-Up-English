import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Clock, ArrowRight,
  LogOut, User, Hash, ChevronDown, Sparkles,
  FileText, Brain, Target, BarChart3, Shield,
  Trophy, Medal, Flame, Crown, Timer,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── animation presets ─── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const, delay },
});

/* ─── Floating orb ─── */
function Orb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[80px] pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.18, 0.28, 0.18] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* ─── Profile type ─── */
interface Profile {
  full_name: string;
  nim: string;
  email: string;
  username: string;
}

/* ─── Package type ─── */
interface ExamPackage {
  id: string;
  title: string;
  description: string;
  has_study_mode: boolean;
}

interface LeaderboardEntry {
  id: string | number;
  name: string;
  initials: string;
  score: number;
  rank: number;
}


/* ══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ExamPackage | null>(null);
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [packageLeaderboard, setPackageLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    document.title = "Dashboard — Digitalized EPT Reading Preparation";

    async function fetchProfile() {
      if (!supabase) { setIsLoading(false); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Not logged in → redirect to login
        navigate("/login", { replace: true });
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, nim, email, username")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setIsLoading(false);
    }

    async function fetchPackages() {
      const { data, error } = await supabase
        .from('exam_packages')
        .select('id, title, description, has_study_mode')
        .order('created_at', { ascending: true });
        
      const mockPackage: ExamPackage = {
        id: "mock-skripsi",
        title: "Reading Section Only",
        description: "Paket soal ini sudah di-mapping dan sudah di-uji, siap untuk digunakan untuk belajar.",
        has_study_mode: true
      };

      if (!error && data && data.length > 0) {
        const dbPackages = data.map((pkg, idx) => ({
          ...pkg,
          title: (pkg.title === "Question Set 1" ? "Question Set 2" : (pkg.title || `Question Set ${idx + 2}`)),
          description: (pkg.description && pkg.description.trim())
            ? pkg.description
            : "Question set ini belum di-mapping dan masih prototipe serta belum divalidasi.",
        }));
        setPackages([mockPackage, ...dbPackages]);
      } else {
        const fallbackPackage2: ExamPackage = {
          id: "practice-test-2",
          title: "Question Set 2",
          description: "Question set ini belum di-mapping dan masih prototipe serta belum divalidasi.",
          has_study_mode: false
        };
        setPackages([mockPackage, fallbackPackage2]);
      }
    }

    async function fetchLeaderboards() {
      if (!supabase) return;

      // Global Leaderboard: Aggregate scores by user
      const { data: globalData, error: globalErr } = await supabase
        .from('exam_results')
        .select(`
          user_id,
          score,
          profiles(full_name)
        `);

      if (!globalErr && globalData) {
        const aggregated: Record<string, any> = {};
        globalData.forEach((row: any) => {
          const userId = row.user_id;
          if (!aggregated[userId]) {
            const name = row.profiles?.full_name || 'Unknown';
            aggregated[userId] = {
              id: userId,
              name,
              initials: getInitials(name),
              score: row.score
            };
          } else {
            aggregated[userId].score += row.score;
          }
        });
        
        const sortedGlobal = Object.values(aggregated)
          .sort((a, b) => b.score - a.score)
          .map((user, idx) => ({ ...user, rank: idx + 1 }))
          .slice(0, 5); // top 5
          
        setGlobalLeaderboard(sortedGlobal);
      }

      // Package Leaderboard: Top scores for the reading section only (e.g. mock-skripsi or any package)
      // Since it says "Reading Section", let's get top scores for the mock-skripsi package as an example
      const { data: packageData, error: packageErr } = await supabase
        .from('exam_results')
        .select(`
          user_id,
          score,
          package_id,
          profiles(full_name)
        `)
        .order('score', { ascending: false })
        .limit(20);

      if (!packageErr && packageData) {
        // filter distinct users so one user only appears once in the package leaderboard with their best score
        const seenUsers = new Set();
        const topUnique: any[] = [];
        for (const row of packageData) {
          if (!seenUsers.has(row.user_id)) {
            seenUsers.add(row.user_id);
            const name = row.profiles?.full_name || 'Unknown';
            topUnique.push({
              id: row.user_id + '-' + row.package_id,
              name,
              initials: getInitials(name),
              score: row.score
            });
            if (topUnique.length === 5) break;
          }
        }
        
        const sortedPackage = topUnique.map((u, idx) => ({ ...u, rank: idx + 1 }));
        setPackageLeaderboard(sortedPackage);
      }
    }

    fetchProfile();
    fetchPackages();
    fetchLeaderboards();
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut();
    navigate("/login", { replace: true });
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#030014" }}>
      {/* ── Background orbs ── */}
      <Orb className="w-[700px] h-[700px] -top-[300px] -right-[200px] bg-violet-600/30" delay={0} />
      <Orb className="w-[500px] h-[500px] -bottom-[200px] -left-[100px] bg-indigo-500/25" delay={3} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ══════════ NAVBAR ══════════ */}
      <nav className="relative z-30 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left — Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, hsl(258 84% 60%), hsl(280 60% 55%))" }}
              >
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[15px] font-black text-white tracking-tight">LevelUp</span>
                <span className="text-[15px] font-black text-transparent bg-clip-text ml-1" style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #818cf8)" }}>English</span>
              </div>
            </div>

            {/* Right — User Menu */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
              ) : profile ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-white/[0.06] transition-colors outline-none">
                      <Avatar className="h-8 w-8 border-2 border-violet-500/40">
                        <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                          {getInitials(profile.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block text-sm font-semibold text-white/80 max-w-[140px] truncate">{profile.full_name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 bg-[#0f0a1e] border-white/10 text-white">
                    <DropdownMenuLabel className="font-normal px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-violet-500/30">
                          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-sm font-bold">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{profile.full_name}</p>
                          <p className="text-xs text-white/40 font-medium truncate">{profile.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <div className="px-3 py-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium">Username:</span>
                        <span className="text-white/70 font-semibold">{profile.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Hash className="w-3.5 h-3.5" />
                        <span className="font-medium">NIM:</span>
                        <span className="text-white/70 font-semibold">{profile.nim}</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer mx-1 mb-1 rounded-lg"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="flex-1 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ── Hero / Welcome Section ── */}
          <motion.div {...fadeUp(0.1)} className="mb-10 sm:mb-14">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-72 bg-white/10 rounded-lg" />
                <Skeleton className="h-5 w-96 bg-white/5 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-violet-400/20 bg-violet-500/10 backdrop-blur-md mb-4">
                  <Sparkles className="w-3 h-3 text-violet-300" />
                  <span className="text-violet-200">Student Dashboard</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #a78bfa, #818cf8)" }}>
                    {profile?.full_name || "Student"}
                  </span>
                  ! 👋
                </h1>
                <p className="mt-2 text-sm sm:text-base text-white/50 font-medium max-w-xl">
                  Ready to sharpen your reading skills? Choose a test package below and track your progress towards UMEPT excellence.
                </p>
              </>
            )}
          </motion.div>

          {/* ── Quick Stats ── */}
          <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
            {[
              { icon: BookOpen, value: "50", label: "Total Items", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
              { icon: Clock, value: "55 min", label: "Test Duration", color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
              { icon: Brain, value: "Brown's", label: "Taxonomy", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { icon: Target, value: "UMEPT", label: "Preparation", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            ].map((stat, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-sm ${stat.bg}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg}`}>
                  <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} />
                </div>
                <div>
                  <div className="text-sm font-black text-white leading-none">{stat.value}</div>
                  <div className="text-[10px] text-white/40 mt-0.5 leading-none">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Exam Packages Section ── */}
          <motion.div {...fadeUp(0.3)}>
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Available Test Packages</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {packages.map((pkg, index) => {
                const isReadingOnly = pkg.id === 'mock-skripsi';
                const title = isReadingOnly ? "Reading Section Only" : (pkg.title || `Question Set ${index + 1}`);
                const description = isReadingOnly 
                  ? "Paket soal ini sudah di-mapping dan sudah di-uji, siap untuk digunakan untuk belajar."
                  : (pkg.description || "Question set ini belum di-mapping dan masih prototipe serta belum divalidasi.");
                const duration = isReadingOnly ? "55 Minutes" : "~115 Minutes";
                const itemsCount = isReadingOnly ? "50 Items" : "140 Items";
                const categoryLabel = isReadingOnly ? "Reading Comprehension (Section 3)" : "Full Simulation (All 3 Sections)";

                // Cosmetic assignments
                const gradients = [
                  "from-violet-600 to-indigo-600",
                  "from-emerald-500 to-teal-500",
                  "from-blue-600 to-cyan-500",
                  "from-purple-600 to-pink-600",
                ];
                const gradient = isReadingOnly ? gradients[0] : (gradients[index % gradients.length] || gradients[1]);
                const badgeColor = isReadingOnly 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : (pkg.has_study_mode ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" : "bg-amber-500/20 text-amber-300 border-amber-500/30");
                const badgeText = isReadingOnly 
                  ? "Ready for Study" 
                  : (pkg.has_study_mode ? "Study & Exam" : "Full Exam");
                const Icon = isReadingOnly ? BookOpen : FileText;
                
                return (
                  <motion.div key={pkg.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-md overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                      {/* Gradient strip */}
                      <div className={`h-1 w-full bg-gradient-to-r ${gradient}`} />

                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-[15px] font-bold text-white tracking-tight leading-tight">{title}</CardTitle>
                              <p className="text-[11px] text-white/40 font-medium mt-0.5">{categoryLabel}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${badgeColor}`}>
                            {badgeText}
                          </span>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-4">
                        <p className="text-xs text-white/50 font-medium leading-relaxed mb-4">{description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold">{duration}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <FileText className="w-3.5 h-3.5" />
                            <span className="font-semibold">{itemsCount}</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="pt-0 pb-5">
                        <Button
                          onClick={() => { setSelectedPackage(pkg); setShowModeDialog(true); }}
                          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all"
                        >
                          Start Test <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Leaderboard Section ── */}
          <motion.div {...fadeUp(0.4)} className="mt-10 sm:mt-14">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Top Performers</h2>
            </div>

            <Card className="bg-white/[0.03] border-white/[0.08] backdrop-blur-md overflow-hidden p-1 sm:p-2">
              <Tabs defaultValue="global" className="w-full">
                <div className="px-3 pt-3 pb-1">
                  <TabsList className="bg-white/[0.05] border border-white/[0.05] p-1 h-auto w-full sm:w-auto inline-flex rounded-xl">
                    <TabsTrigger value="global" className="rounded-lg py-2 text-xs sm:text-sm text-white/60 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all w-full sm:w-auto px-6">
                      <Flame className="w-3.5 h-3.5 mr-2" /> Global Ranking
                    </TabsTrigger>
                    <TabsTrigger value="package1" className="rounded-lg py-2 text-xs sm:text-sm text-white/60 data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all w-full sm:w-auto px-6">
                      <Medal className="w-3.5 h-3.5 mr-2" /> Reading Section
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="global" className="mt-2 p-3 sm:p-4 outline-none">
                  <div className="space-y-2 sm:space-y-3">
                    {globalLeaderboard.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors group">
                        <div className="flex-shrink-0 w-8 text-center font-black">
                          {user.rank === 1 ? <Crown className="w-5 h-5 mx-auto text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> : 
                           user.rank === 2 ? <span className="text-slate-300 text-base sm:text-lg drop-shadow-md">2</span> : 
                           user.rank === 3 ? <span className="text-amber-600 text-base sm:text-lg drop-shadow-md">3</span> : 
                           <span className="text-white/30 text-base sm:text-lg">{user.rank}</span>}
                        </div>
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white/10 group-hover:border-violet-500/30 transition-colors">
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs font-bold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-[15px] font-bold text-white truncate group-hover:text-violet-100 transition-colors">{user.name}</p>
                          <p className="text-[10px] sm:text-xs text-white/40 font-medium truncate">Total Score</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #818cf8)" }}>
                            {user.score}
                          </span>
                          <span className="text-white/40 text-[10px] ml-1">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="package1" className="mt-2 p-3 sm:p-4 outline-none">
                  <div className="space-y-2 sm:space-y-3">
                    {packageLeaderboard.map((user) => (
                      <div key={user.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors group">
                        <div className="flex-shrink-0 w-8 text-center font-black">
                          {user.rank === 1 ? <Crown className="w-5 h-5 mx-auto text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" /> : 
                           user.rank === 2 ? <span className="text-slate-300 text-base sm:text-lg drop-shadow-md">2</span> : 
                           user.rank === 3 ? <span className="text-amber-600 text-base sm:text-lg drop-shadow-md">3</span> : 
                           <span className="text-white/30 text-base sm:text-lg">{user.rank}</span>}
                        </div>
                        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white/10 group-hover:border-indigo-500/30 transition-colors">
                          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white text-xs font-bold">
                            {user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-[15px] font-bold text-white truncate group-hover:text-indigo-100 transition-colors">{user.name}</p>
                          <p className="text-[10px] sm:text-xs text-white/40 font-medium truncate">Package Score</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm sm:text-base font-black text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c4b5fd, #818cf8)" }}>
                            {user.score}
                          </span>
                          <span className="text-white/40 text-[10px] ml-1">pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>

          {/* ── Footer ── */}
          <motion.div {...fadeUp(0.5)} className="mt-14 pb-8 text-center">
            <div className="flex items-center justify-center gap-2 text-white/20 mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Your data is securely encrypted and used solely for academic research.</span>
            </div>
            <p className="text-[10px] text-white/20 italic font-medium">
              Content adapted from CLIFFS TOEFL Preparation Guide by Michael A. Pyle &amp; Mary Ellen Munoz Page. For research &amp; educational purposes only.
            </p>
          </motion.div>
        </div>
            </main>

      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-slate-950 border-slate-800">
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-2">Select Test Mode</h2>
            <p className="text-slate-400 text-sm mb-6">Choose how you want to take {selectedPackage?.title}</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Examination Mode Card */}
              <button 
                onClick={() => {
                  setShowModeDialog(false);
                  navigate("/test", { state: { preselectedSet: selectedPackage?.id, hasStudyMode: selectedPackage?.has_study_mode, mode: 'exam' } });
                }}
                className="text-left p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 transition-all flex flex-col gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Examination Mode</h3>
                  <p className="text-xs text-indigo-200/70 mt-1">Strict 55-minute countdown timer with no immediate feedback.</p>
                </div>
              </button>

              {/* Study Mode Card */}
              <button 
                disabled={!selectedPackage?.has_study_mode}
                onClick={() => {
                  setShowModeDialog(false);
                  navigate("/test", { state: { preselectedSet: selectedPackage?.id, hasStudyMode: selectedPackage?.has_study_mode, mode: 'study' } });
                }}
                className={`text-left p-5 rounded-xl border flex flex-col gap-3 transition-all ${selectedPackage?.has_study_mode ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 cursor-pointer' : 'border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedPackage?.has_study_mode ? 'bg-emerald-500/20' : 'bg-slate-800'}`}>
                  <BookOpen className={`w-5 h-5 ${selectedPackage?.has_study_mode ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <h3 className={`font-bold ${selectedPackage?.has_study_mode ? 'text-white' : 'text-slate-400'}`}>Study Mode</h3>
                  <p className={`text-xs mt-1 ${selectedPackage?.has_study_mode ? 'text-emerald-200/70' : 'text-slate-500'}`}>
                    {selectedPackage?.has_study_mode ? 'Untimed, self-paced progression with immediate feedback.' : 'Not available for this Question Set.'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}