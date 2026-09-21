import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, BookOpen, LogOut, Plus, Edit2, Trash2, Save, X, 
  Search, RefreshCw, Volume2, Headphones, FileText, CheckCircle,
  HelpCircle, Layers, ExternalLink, Play, AlertCircle, Upload, FileUp, CheckCircle2, ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  nim: string;
  created_at: string;
  tests_count?: number;
  highest_score?: number;
}

interface ExamPackage {
  id: string;
  title: string;
  description: string;
  has_study_mode: boolean;
  created_at?: string;
}

interface QuestionItem {
  id?: number | string;
  package_id?: string;
  exam_package_id?: string;
  section_type: 'listening' | 'structure' | 'reading';
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  audio_url?: string | null;
  passage_title?: string | null;
  passage_text?: string | null;
  explanation?: string | null;
  skill?: string | null;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState<'users' | 'questions'>('users');
  
  // Users state
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  
  // Packages state
  const [packages, setPackages] = useState<ExamPackage[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('all');
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [newPackage, setNewPackage] = useState<ExamPackage>({
    id: '',
    title: '',
    description: '',
    has_study_mode: false
  });
  const [savingPackage, setSavingPackage] = useState(false);

  // Import from JSON state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<{ total: number; listening: number; structure: number; reading: number }>({
    total: 0, listening: 0, structure: 0, reading: 0
  });
  const [importTitle, setImportTitle] = useState('');
  const [importDescription, setImportDescription] = useState('');
  const [importAudioUrl, setImportAudioUrl] = useState('');
  const [importHasStudyMode, setImportHasStudyMode] = useState(false);
  const [importTargetMode, setImportTargetMode] = useState<'new' | 'existing'>('new');
  const [importTargetPackageId, setImportTargetPackageId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; stage: string }>({
    current: 0, total: 0, stage: ''
  });

  // Questions state
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<'all' | 'listening' | 'structure' | 'reading'>('all');
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123' || password === import.meta.env.VITE_MASTER_TOKEN || password === 'ADINGAMPANG') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      toast({ title: 'Success', description: 'Logged in as Admin' });
    } else {
      toast({ title: 'Error', description: 'Incorrect admin password', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
  };

  // 1. Fetch Users directly from profiles table
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      // Fetch registered users from profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (profilesError) throw profilesError;

      // Also fetch exam_results to aggregate stats
      const { data: resultsData } = await supabase
        .from('exam_results')
        .select('user_id, score');

      const scoreMap: Record<string, { count: number; maxScore: number }> = {};
      if (resultsData) {
        resultsData.forEach((r: any) => {
          if (!scoreMap[r.user_id]) {
            scoreMap[r.user_id] = { count: 0, maxScore: 0 };
          }
          scoreMap[r.user_id].count += 1;
          if (r.score > scoreMap[r.user_id].maxScore) {
            scoreMap[r.user_id].maxScore = r.score;
          }
        });
      }

      const enrichedProfiles: Profile[] = (profilesData || []).map((p: any) => ({
        ...p,
        tests_count: scoreMap[p.id]?.count || 0,
        highest_score: scoreMap[p.id]?.maxScore || 0
      }));

      setUsers(enrichedProfiles);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      toast({ title: 'Error fetching users', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  // 2. Fetch Exam Packages
  const fetchPackages = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('exam_packages')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setPackages(data);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  // 3. Fetch Questions
  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      
      let query = supabase
        .from('questions')
        .select('*')
        .order('question_number', { ascending: true });

      if (selectedPackageId !== 'all') {
        query = query.or(`package_id.eq.${selectedPackageId},exam_package_id.eq.${selectedPackageId}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setQuestions(data || []);
    } catch (err: any) {
      console.error('Error fetching questions:', err);
      toast({ title: 'Error fetching questions', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPackages();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'questions') fetchQuestions();
    }
  }, [isAuthenticated, activeTab, selectedPackageId]);

  // 4. Save Exam Package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackage.title.trim()) {
      toast({ title: 'Validation Error', description: 'Package Title is required', variant: 'destructive' });
      return;
    }

    setSavingPackage(true);
    try {
      if (!supabase) throw new Error('Supabase not initialized');

      // Generate a valid UUID to conform with PostgreSQL UUID primary key
      const packageId = crypto.randomUUID();
      const { error } = await supabase
        .from('exam_packages')
        .insert([{
          id: packageId,
          title: newPackage.title.trim(),
          description: newPackage.description.trim(),
          has_study_mode: newPackage.has_study_mode,
          is_active: true
        }]);

      if (error) throw error;

      toast({ title: 'Success', description: `Exam package "${newPackage.title.trim()}" added successfully!` });
      setIsPackageModalOpen(false);
      setNewPackage({ id: '', title: '', description: '', has_study_mode: false });
      await fetchPackages();
      setSelectedPackageId(packageId);
    } catch (err: any) {
      toast({ title: 'Failed to create package', description: err.message, variant: 'destructive' });
    } finally {
      setSavingPackage(false);
    }
  };

  // Delete Exam Package & its questions
  const handleDeletePackage = async (pkgId: string) => {
    const targetPkg = packages.find(p => p.id === pkgId);
    const confirmName = targetPkg?.title || pkgId;
    if (!window.confirm(`Are you sure you want to delete package "${confirmName}" and ALL of its questions? This action cannot be undone.`)) {
      return;
    }

    try {
      if (!supabase) throw new Error('Supabase not initialized');

      // 1. Delete questions referencing this package
      await supabase
        .from('questions')
        .delete()
        .or(`package_id.eq.${pkgId},exam_package_id.eq.${pkgId}`);

      // 2. Delete the package row
      const { error } = await supabase
        .from('exam_packages')
        .delete()
        .eq('id', pkgId);

      if (error) throw error;

      toast({ title: 'Package Deleted', description: `Package "${confirmName}" and its questions were removed.` });
      setSelectedPackageId('all');
      await fetchPackages();
      await fetchQuestions();
    } catch (err: any) {
      toast({ title: 'Failed to delete package', description: err.message, variant: 'destructive' });
    }
  };

  // File parsing for JSON import
  const handleFileSelect = (file: File) => {
    if (!file) return;
    setImportFile(file);

    // Suggest title from file name
    const baseName = file.name.replace(/\.json$/i, '');
    let suggestedTitle = 'Question Set ' + (packages.length + 2);
    if (/test[-_ ]?(\d+)/i.test(baseName)) {
      const match = baseName.match(/test[-_ ]?(\d+)/i);
      suggestedTitle = `Question Set ${match?.[1] || 4}`;
    } else if (/set[-_ ]?(\d+)/i.test(baseName)) {
      const match = baseName.match(/set[-_ ]?(\d+)/i);
      suggestedTitle = `Question Set ${match?.[1] || 4}`;
    } else {
      suggestedTitle = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    }
    setImportTitle(suggestedTitle);
    setImportDescription(`Full TOEFL practice package imported from ${file.name}`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const json = JSON.parse(text);
        if (!Array.isArray(json)) {
          throw new Error('File JSON harus berisi daftar (array) objek soal. Contoh: [ { "section_type": ... }, ... ]');
        }

        let listening = 0;
        let structure = 0;
        let reading = 0;

        json.forEach((q: any, idx: number) => {
          const qNum = Number(q.question_number) || (idx + 1);
          const sec = (q.section_type || (qNum <= 50 ? 'listening' : qNum <= 90 ? 'structure' : 'reading')).toLowerCase().trim();
          if (sec === 'listening') listening++;
          else if (sec === 'structure') structure++;
          else reading++;
        });

        setParsedQuestions(json);
        setImportStats({
          total: json.length,
          listening,
          structure,
          reading
        });
        toast({ title: 'JSON File Loaded', description: `Berhasil memuat ${json.length} soal (${listening} Listening, ${structure} Structure, ${reading} Reading)` });
      } catch (err: any) {
        console.error('Error parsing JSON:', err);
        toast({ title: 'Invalid JSON File', description: err.message, variant: 'destructive' });
        setParsedQuestions([]);
        setImportStats({ total: 0, listening: 0, structure: 0, reading: 0 });
      }
    };
    reader.readAsText(file);
  };

  // Execute JSON Import to Supabase
  const handleExecuteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parsedQuestions.length) {
      toast({ title: 'No questions loaded', description: 'Please select a valid JSON file first', variant: 'destructive' });
      return;
    }

    if (importTargetMode === 'new' && !importTitle.trim()) {
      toast({ title: 'Title required', description: 'Please enter a title for the new package', variant: 'destructive' });
      return;
    }

    if (importTargetMode === 'existing' && !importTargetPackageId) {
      toast({ title: 'Select Package', description: 'Please select an existing package to import into', variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    try {
      if (!supabase) throw new Error('Supabase not initialized');

      let targetPackageId = importTargetPackageId;

      if (importTargetMode === 'new') {
        targetPackageId = crypto.randomUUID();
        setImportProgress({ current: 0, total: parsedQuestions.length, stage: 'Creating exam package row in Supabase...' });

        const { error: pkgError } = await supabase
          .from('exam_packages')
          .insert([{
            id: targetPackageId,
            title: importTitle.trim(),
            description: importDescription.trim(),
            has_study_mode: importHasStudyMode,
            is_active: true
          }]);

        if (pkgError) throw pkgError;
      }

      // Format questions
      const formattedQuestions = parsedQuestions.map((q: any, idx: number) => {
        const qNum = Number(q.question_number) || (idx + 1);
        const secType = (q.section_type || (qNum <= 50 ? 'listening' : qNum <= 90 ? 'structure' : 'reading')).toLowerCase().trim();

        const optA = q.option_a ?? q.options?.[0] ?? '';
        const optB = q.option_b ?? q.options?.[1] ?? '';
        const optC = q.option_c ?? q.options?.[2] ?? '';
        const optD = q.option_d ?? q.options?.[3] ?? '';

        let ans = (q.correct_answer ?? q.answer ?? q.key ?? 'A').toString().trim().toUpperCase();
        if (ans === '0') ans = 'A';
        else if (ans === '1') ans = 'B';
        else if (ans === '2') ans = 'C';
        else if (ans === '3') ans = 'D';

        const audioUrl = secType === 'listening' ? (q.audio_url || importAudioUrl.trim() || null) : null;

        return {
          id: crypto.randomUUID(),
          package_id: targetPackageId,
          exam_package_id: targetPackageId,
          section_type: secType,
          question_number: qNum,
          question_text: q.question_text ?? q.text ?? `Question ${qNum}`,
          option_a: optA,
          option_b: optB,
          option_c: optC,
          option_d: optD,
          correct_answer: ans,
          explanation: q.explanation || null,
          passage_text: q.passage_text || null,
          audio_url: audioUrl
        };
      });

      // Insert in chunks of 50
      const BATCH_SIZE = 50;
      for (let i = 0; i < formattedQuestions.length; i += BATCH_SIZE) {
        const batch = formattedQuestions.slice(i, i + BATCH_SIZE);
        const currentCount = Math.min(i + BATCH_SIZE, formattedQuestions.length);
        setImportProgress({
          current: currentCount,
          total: formattedQuestions.length,
          stage: `Uploading questions ${i + 1} - ${currentCount} of ${formattedQuestions.length}...`
        });

        const { error: batchError } = await supabase
          .from('questions')
          .insert(batch);

        if (batchError) throw batchError;
      }

      const targetPkg = packages.find(p => p.id === targetPackageId);
      const pkgTitleDisplay = importTargetMode === 'new' 
        ? (importTitle || 'Exam Package') 
        : (targetPkg?.title || targetPackageId);

      toast({
        title: '🎉 Import Berhasil!',
        description: `Berhasil menambahkan ${formattedQuestions.length} soal ke paket "${pkgTitleDisplay}" di Supabase!`,
      });

      setIsImportModalOpen(false);
      setParsedQuestions([]);
      setImportFile(null);
      setImportAudioUrl('');

      await fetchPackages();
      setSelectedPackageId(targetPackageId);
      await fetchQuestions();
    } catch (err: any) {
      console.error('Import error:', err);
      toast({
        title: 'Import Gagal',
        description: err.message || 'Terjadi kesalahan saat mengunggah soal ke Supabase',
        variant: 'destructive'
      });
    } finally {
      setIsImporting(false);
    }
  };

  // 5. Save Question
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    setSavingQuestion(true);
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      
      const targetPackage = editingQuestion.package_id || (selectedPackageId !== 'all' ? selectedPackageId : (packages[0]?.id || 'practice-test-2'));

      const payload: any = {
        package_id: targetPackage,
        exam_package_id: targetPackage,
        section_type: editingQuestion.section_type,
        question_number: Number(editingQuestion.question_number),
        question_text: editingQuestion.question_text,
        option_a: editingQuestion.option_a,
        option_b: editingQuestion.option_b,
        option_c: editingQuestion.option_c,
        option_d: editingQuestion.option_d,
        correct_answer: editingQuestion.correct_answer,
        explanation: editingQuestion.explanation || null,
        audio_url: editingQuestion.section_type === 'listening' ? (editingQuestion.audio_url || null) : null,
        passage_text: editingQuestion.section_type === 'reading' ? (editingQuestion.passage_text || null) : null,
      };

      if (editingQuestion.id) {
        const { error } = await supabase
          .from('questions')
          .update(payload)
          .eq('id', editingQuestion.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Question updated successfully!' });
      } else {
        const { error } = await supabase
          .from('questions')
          .insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Question added to database!' });
      }
      
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
      fetchQuestions();
    } catch (err: any) {
      toast({ title: 'Error saving question', description: err.message, variant: 'destructive' });
    } finally {
      setSavingQuestion(false);
    }
  };

  // 6. Delete Question
  const handleDeleteQuestion = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Question deleted' });
      fetchQuestions();
    } catch (err: any) {
      toast({ title: 'Error deleting', description: err.message, variant: 'destructive' });
    }
  };

  const openNewQuestionModal = () => {
    const nextQNum = questions.length > 0 
      ? Math.max(...questions.map(q => Number(q.question_number) || 0)) + 1 
      : 1;

    setEditingQuestion({
      package_id: selectedPackageId !== 'all' ? selectedPackageId : (packages[0]?.id || 'practice-test-2'),
      section_type: 'structure',
      question_number: nextQNum,
      passage_title: '',
      passage_text: '',
      audio_url: '',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      explanation: '',
      skill: ''
    });
    setIsQuestionModalOpen(true);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const q = searchUserQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.nim || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q)
    );
  });

  // Filtered questions
  const filteredQuestions = questions.filter(q => {
    if (selectedSectionFilter === 'all') return true;
    return q.section_type === selectedSectionFilter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030014] text-white p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mx-auto mb-3 border border-violet-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mb-1">Admin Portal</h1>
            <p className="text-sm text-slate-400">Level-Up English Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                autoFocus
              />
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/20 transition-all"
            >
              Log In to Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Admin Navbar */}
      <nav className="bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
            L
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white leading-none">LevelUp English</h1>
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400">Admin Control Panel</span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors text-slate-300"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 flex md:flex-col gap-1.5">
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'users' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
              <Users className="w-4 h-4" /> Participants ({users.length})
            </button>
            <button 
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all flex-1 md:flex-none ${activeTab === 'questions' ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
              <BookOpen className="w-4 h-4" /> Question Bank
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-slate-900/60 rounded-2xl border border-slate-800/80 shadow-xl p-6 overflow-hidden">
          
          {/* ================= PARTICIPANTS TAB ================= */}
          {activeTab === 'users' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Registered Participants</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Data directly loaded from the <code className="text-violet-400 bg-violet-950/60 px-1.5 py-0.5 rounded text-xs">profiles</code> table in Supabase.
                  </p>
                </div>
                <button 
                  onClick={fetchUsers} 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} /> Refresh
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                  placeholder="Search participants by name, NIM, email, or username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {loadingUsers ? (
                <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
                  <span>Fetching participants from Supabase...</span>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3.5">Participant</th>
                        <th className="px-4 py-3.5">NIM</th>
                        <th className="px-4 py-3.5">Email</th>
                        <th className="px-4 py-3.5">Username</th>
                        <th className="px-4 py-3.5 text-center">Tests Taken</th>
                        <th className="px-4 py-3.5 text-center">Best Score</th>
                        <th className="px-4 py-3.5">Registered</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u, idx) => {
                        const dateFormatted = u.created_at 
                          ? new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-';

                        return (
                          <tr key={u.id || idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-semibold text-white flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center text-xs font-bold border border-violet-500/30">
                                {(u.full_name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span>{u.full_name || 'No Name'}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-300">{u.nim || '-'}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">{u.email}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">@{u.username}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                                {u.tests_count || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-violet-400">
                              {u.highest_score || '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{dateFormatted}</td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                            No registered participants found in <code className="text-violet-400">profiles</code> table.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= QUESTION BANK TAB ================= */}
          {activeTab === 'questions' && (
            <div>
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Question Bank &amp; Packages</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Manage test packages and customize section questions with listening audio &amp; reading passages.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <button 
                    onClick={() => {
                      setImportFile(null);
                      setParsedQuestions([]);
                      setImportTitle('Question Set ' + (packages.length + 2));
                      setImportDescription('');
                      setImportAudioUrl('');
                      setImportTargetMode('new');
                      setImportTargetPackageId(packages[0]?.id || '');
                      setIsImportModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <FileUp className="w-4 h-4" /> 📥 Import from JSON
                  </button>
                  <button 
                    onClick={() => {
                      setNewPackage({ id: '', title: '', description: '', has_study_mode: false });
                      setIsPackageModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Layers className="w-4 h-4 text-violet-400" /> + New Package
                  </button>
                  <button 
                    onClick={openNewQuestionModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/20"
                  >
                    <Plus className="w-4 h-4" /> Add Question
                  </button>
                </div>
              </div>

              {/* Package & Section Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Filter by Exam Package
                  </label>
                  <select 
                    value={selectedPackageId}
                    onChange={e => setSelectedPackageId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="all">-- All Exam Packages ({packages.length}) --</option>
                    {packages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title} ({pkg.id.slice(0, 8)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Filter by Section
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    {(['all', 'listening', 'structure', 'reading'] as const).map(sec => (
                      <button
                        key={sec}
                        onClick={() => setSelectedSectionFilter(sec)}
                        className={`py-1.5 text-xs font-bold rounded-lg capitalize transition ${selectedSectionFilter === sec ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Package Details and Actions when a package is selected */}
              {selectedPackageId !== 'all' && (
                <div className="mb-6 p-4 rounded-xl bg-slate-950/80 border border-violet-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {packages.find(p => p.id === selectedPackageId)?.title || selectedPackageId}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-700/50">
                        ID: {selectedPackageId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {filteredQuestions.length} Questions Loaded
                      </span>
                      {packages.find(p => p.id === selectedPackageId)?.has_study_mode && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                          Study Mode Enabled
                        </span>
                      )}
                    </div>
                    {packages.find(p => p.id === selectedPackageId)?.description && (
                      <p className="text-xs text-slate-400 mt-1">
                        {packages.find(p => p.id === selectedPackageId)?.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeletePackage(selectedPackageId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
                      title="Delete this package and its questions from Supabase"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Package
                    </button>
                  </div>
                </div>
              )}

              {/* Questions List */}
              {loadingQuestions ? (
                <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-violet-500" />
                  <span>Loading questions from Supabase...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => {
                    const sec = q.section_type || 'structure';
                    const secColor = sec === 'listening' 
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                      : sec === 'reading' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                      : 'bg-purple-500/10 text-purple-400 border-purple-500/30';

                    return (
                      <div key={q.id || idx} className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:border-slate-700 transition group">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-black px-2.5 py-0.5 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-md">
                              Q{q.question_number}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${secColor}`}>
                              {sec}
                            </span>
                            {q.package_id && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                {q.package_id}
                              </span>
                            )}
                            <span className="text-xs font-bold text-emerald-400 ml-auto">
                              Answer: {q.correct_answer}
                            </span>
                          </div>

                          {/* Passage Title if reading */}
                          {sec === 'reading' && q.passage_title && (
                            <p className="text-xs font-bold text-emerald-300/80 mb-1">
                              📖 {q.passage_title}
                            </p>
                          )}

                          {/* Audio URL if listening */}
                          {sec === 'listening' && q.audio_url && (
                            <div className="flex items-center gap-2 my-1.5 p-2 rounded-lg bg-blue-950/40 border border-blue-800/40 text-xs text-blue-300">
                              <Headphones className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="truncate flex-1 font-mono text-[11px]">{q.audio_url}</span>
                              <audio controls className="h-6 max-w-[180px]">
                                <source src={q.audio_url} type="audio/mpeg" />
                              </audio>
                            </div>
                          )}

                          <p className="text-sm text-slate-200 line-clamp-2 mt-1" dangerouslySetInnerHTML={{ __html: q.question_text }} />
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button 
                            onClick={() => { setEditingQuestion(q); setIsQuestionModalOpen(true); }}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-violet-400 hover:border-violet-500/50 transition-colors"
                            title="Edit Question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => q.id && handleDeleteQuestion(q.id)}
                            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredQuestions.length === 0 && (
                    <div className="py-16 text-center text-slate-500 text-sm">
                      No questions found matching your filter. Click <strong>Add Question</strong> to insert questions into Supabase!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL 1: ADD EXAM PACKAGE ================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" /> Add Exam Package
              </h2>
              <button onClick={() => setIsPackageModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Package Title *
                </label>
                <input 
                  type="text"
                  value={newPackage.title}
                  onChange={e => setNewPackage({ ...newPackage, title: e.target.value })}
                  placeholder="e.g. Question Set 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea 
                  value={newPackage.description}
                  onChange={e => setNewPackage({ ...newPackage, description: e.target.value })}
                  placeholder="Deskripsi paket soal (misal: Full simulation 3 section)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <input 
                  type="checkbox"
                  id="has_study_mode"
                  checked={newPackage.has_study_mode}
                  onChange={e => setNewPackage({ ...newPackage, has_study_mode: e.target.checked })}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                />
                <label htmlFor="has_study_mode" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Allow Study Mode (Untimed &amp; Immediate Feedback)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsPackageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={savingPackage}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 transition shadow-lg shadow-violet-600/20 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> {savingPackage ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD / EDIT QUESTION ================= */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-violet-400" />
                {editingQuestion.id ? 'Edit Question' : 'Add New Question'}
              </h2>
              <button onClick={() => setIsQuestionModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="question-form" onSubmit={handleSaveQuestion} className="space-y-4">
                
                {/* Package & Section & Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Exam Package *
                    </label>
                    <select 
                      value={editingQuestion.package_id || ''}
                      onChange={e => setEditingQuestion({ ...editingQuestion, package_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                      required
                    >
                      {packages.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Section *
                    </label>
                    <select 
                      value={editingQuestion.section_type}
                      onChange={e => setEditingQuestion({ ...editingQuestion, section_type: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                      required
                    >
                      <option value="listening">Listening (Section 1)</option>
                      <option value="structure">Structure (Section 2)</option>
                      <option value="reading">Reading (Section 3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Question Number *
                    </label>
                    <input 
                      type="number"
                      value={editingQuestion.question_number}
                      onChange={e => setEditingQuestion({ ...editingQuestion, question_number: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                      required
                    />
                  </div>
                </div>

                {/* Listening Audio URL field */}
                {editingQuestion.section_type === 'listening' && (
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
                    <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider">
                      🎧 Supabase Storage Audio URL
                    </label>
                    <input 
                      type="url"
                      value={editingQuestion.audio_url || ''}
                      onChange={e => setEditingQuestion({ ...editingQuestion, audio_url: e.target.value })}
                      placeholder="https://...supabase.co/storage/v1/object/public/.../audio.mp3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-blue-800/60 bg-slate-950 text-xs text-blue-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Upload file audio MP3 Anda ke Storage Supabase (misal bucket: <code>audio</code>), lalu tempelkan link public URL-nya di sini.
                    </p>
                    {editingQuestion.audio_url && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-300 block mb-1">Audio Preview Test:</span>
                        <audio controls className="w-full h-8">
                          <source src={editingQuestion.audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                  </div>
                )}

                {/* Reading Passage field */}
                {editingQuestion.section_type === 'reading' && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                        📖 Reading Passage Title
                      </label>
                      <input 
                        type="text"
                        value={editingQuestion.passage_title || ''}
                        onChange={e => setEditingQuestion({ ...editingQuestion, passage_title: e.target.value })}
                        placeholder="e.g. Passage 1: Carbon Dating and Archaeology"
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-800/60 bg-slate-950 text-xs text-emerald-200 placeholder:text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                        Reading Passage Text (Paragraphs)
                      </label>
                      <textarea 
                        value={editingQuestion.passage_text || ''}
                        onChange={e => setEditingQuestion({ ...editingQuestion, passage_text: e.target.value })}
                        placeholder="Paste passage paragraphs here..."
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-800/60 bg-slate-950 text-xs text-emerald-100 placeholder:text-slate-600 min-h-[120px]"
                      />
                    </div>
                  </div>
                )}

                {/* Question Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Question Sentence / Prompt *
                  </label>
                  <textarea 
                    value={editingQuestion.question_text}
                    onChange={e => setEditingQuestion({ ...editingQuestion, question_text: e.target.value })}
                    placeholder="e.g. What is the main idea of the passage?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 min-h-[80px]"
                    required
                  />
                </div>

                {/* Options A, B, C, D */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['A', 'B', 'C', 'D'] as const).map(letter => {
                    const field = `option_${letter.toLowerCase()}` as keyof QuestionItem;
                    return (
                      <div key={letter}>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Option {letter} *
                        </label>
                        <input 
                          type="text"
                          value={(editingQuestion[field] as string) || ''}
                          onChange={e => setEditingQuestion({ ...editingQuestion, [field]: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                          required
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Correct Answer & Skill */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Correct Answer Key *
                    </label>
                    <select 
                      value={editingQuestion.correct_answer}
                      onChange={e => setEditingQuestion({ ...editingQuestion, correct_answer: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white font-bold"
                      required
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Skill / Category (Optional)
                    </label>
                    <input 
                      type="text"
                      value={editingQuestion.skill || ''}
                      onChange={e => setEditingQuestion({ ...editingQuestion, skill: e.target.value })}
                      placeholder="e.g. Main Idea, Vocabulary, Inversion"
                      className="w-full px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Explanation / Pembahasan (Optional)
                  </label>
                  <textarea 
                    value={editingQuestion.explanation || ''}
                    onChange={e => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                    placeholder="Explanation for study mode and results..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-600 min-h-[60px]"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-800 shrink-0 flex justify-end gap-3 bg-slate-950/80">
              <button 
                type="button"
                onClick={() => setIsQuestionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="question-form"
                disabled={savingQuestion}
                className="px-6 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-violet-600/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {savingQuestion ? 'Saving...' : 'Save Question to Supabase'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: IMPORT PACKAGE FROM JSON ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileUp className="w-5 h-5 text-emerald-400" />
                Import Exam Package from JSON
              </h2>
              <button 
                onClick={() => !isImporting && setIsImportModalOpen(false)} 
                disabled={isImporting}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* File Dropzone / Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select JSON File (e.g. soal-test-4.json) *
                </label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                  }}
                  className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-slate-950/60 transition cursor-pointer relative"
                >
                  <input 
                    type="file" 
                    accept=".json,application/json"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                      <Upload className="w-6 h-6" />
                    </div>
                    {importFile ? (
                      <div>
                        <p className="text-sm font-bold text-white">{importFile.name}</p>
                        <p className="text-xs text-slate-400">{(importFile.size / 1024).toFixed(1)} KB — Click or drag to replace</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-slate-200">Click to browse or drag & drop JSON file</p>
                        <p className="text-xs text-slate-500">Supports full test files with listening, structure &amp; reading sections</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Question Preview Stats */}
              {parsedQuestions.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">File Analyzed Successfully</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-lg font-black text-white">{importStats.total}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Total Questions</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-blue-900/40">
                      <span className="text-lg font-black text-blue-400">{importStats.listening}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Listening</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-purple-900/40">
                      <span className="text-lg font-black text-purple-400">{importStats.structure}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Structure</p>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-emerald-900/40">
                      <span className="text-lg font-black text-emerald-400">{importStats.reading}</span>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Reading</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Target Package Mode Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Destination
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setImportTargetMode('new')}
                    className={`p-3 rounded-xl border text-left transition ${importTargetMode === 'new' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                  >
                    <span className="text-xs font-bold block">✨ Create New Package</span>
                    <span className="text-[11px] opacity-75">Creates a new exam package and attaches questions</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImportTargetMode('existing');
                      if (!importTargetPackageId && packages.length > 0) {
                        setImportTargetPackageId(selectedPackageId !== 'all' ? selectedPackageId : packages[0].id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition ${importTargetMode === 'existing' ? 'border-emerald-500 bg-emerald-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'}`}
                  >
                    <span className="text-xs font-bold block">📁 Insert into Existing Package</span>
                    <span className="text-[11px] opacity-75">Append questions to an existing package in DB</span>
                  </button>
                </div>
              </div>

              {/* New Package Details */}
              {importTargetMode === 'new' ? (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Package Title *
                    </label>
                    <input 
                      type="text"
                      value={importTitle}
                      onChange={e => setImportTitle(e.target.value)}
                      placeholder="e.g. Question Set 4"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Package Description
                    </label>
                    <textarea 
                      value={importDescription}
                      onChange={e => setImportDescription(e.target.value)}
                      placeholder="Deskripsi paket soal..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[60px]"
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <input 
                      type="checkbox"
                      id="import_study_mode"
                      checked={importHasStudyMode}
                      onChange={e => setImportHasStudyMode(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="import_study_mode" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Allow Study Mode (Untimed &amp; Immediate Feedback)
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Select Target Package *
                    </label>
                    <select 
                      value={importTargetPackageId}
                      onChange={e => setImportTargetPackageId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">-- Choose Exam Package --</option>
                      {packages.map(p => (
                        <option key={p.id} value={p.id}>{p.title} ({p.id})</option>
                      ))}
                    </select>
                  </div>

                  {importTargetPackageId && (
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">
                          Target: {packages.find(p => p.id === importTargetPackageId)?.title || importTargetPackageId}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          UUID: {importTargetPackageId}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        Ready to attach
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Listening Audio URL from Supabase Storage */}
              <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" /> Listening Audio URL (Storage Supabase)
                  </label>
                  <span className="text-[10px] text-blue-400 font-medium">Optional / Recommended</span>
                </div>
                <input 
                  type="url"
                  value={importAudioUrl}
                  onChange={e => setImportAudioUrl(e.target.value)}
                  placeholder="https://...supabase.co/storage/v1/object/public/audio-files/Listening%20Soal%20TEST%204.mp3"
                  className="w-full px-3.5 py-2 rounded-xl border border-blue-800/60 bg-slate-950 text-xs text-blue-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Link audio dari Storage Supabase ini akan otomatis disematkan ke semua soal Listening (nomor 1 s/d 50).
                </p>
                {importAudioUrl.trim() && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-300 block mb-1">Audio Preview Test:</span>
                    <audio controls className="w-full h-8">
                      <source src={importAudioUrl.trim()} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>

              {/* Upload Progress Indicator */}
              {isImporting && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {importProgress.stage}
                    </span>
                    <span className="text-slate-400 font-mono font-bold">
                      {importProgress.current} / {importProgress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                      style={{ width: `${importProgress.total ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button 
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isImporting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isImporting || !parsedQuestions.length}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-600/25 flex items-center gap-2 disabled:opacity-50"
                >
                  <FileUp className="w-4 h-4" /> 
                  {isImporting ? 'Importing to Supabase...' : `Import ${parsedQuestions.length || ''} Questions to Supabase`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
