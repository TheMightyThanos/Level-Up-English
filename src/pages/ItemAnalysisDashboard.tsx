import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Users, BarChart3, TrendingUp, TrendingDown, Download,
  Shuffle, ArrowLeft, ChevronUp, ChevronDown, Search,
  GraduationCap, Target, Activity, Hash, Upload, FileText, AlertCircle, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

// ── Types ──────────────────────────────────────────────
interface Student {
  id: string;
  name: string;
  responses: number[];
  totalScore: number;
}

interface ItemAnalysis {
  itemNumber: number;
  ba: number;
  bb: number;
  totalCorrect: number;
  pIndex: number;
  pStatus: 'Difficult' | 'Moderate' | 'Easy';
  dIndex: number;
  dStatus: 'Poor' | 'Satisfactory' | 'Good' | 'Excellent';
}

// ── Constants ──────────────────────────────────────────
const TOTAL_ITEMS = 140;
const PERCENT_GROUP = 0.27;

const FIRST_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gilang', 'Hana',
  'Irfan', 'Joko', 'Kartika', 'Lina', 'Muhammad', 'Nadia', 'Omar',
  'Putri', 'Qori', 'Rina', 'Sari', 'Teguh', 'Umar', 'Vina', 'Wahyu',
  'Xena', 'Yusuf', 'Zahra', 'Arif', 'Bella', 'Cahya', 'Dimas',
  'Endah', 'Fajar', 'Galih', 'Hendra', 'Indah', 'Johan', 'Kirana',
  'Laras', 'Maya', 'Niko', 'Oktavia', 'Pramono', 'Rahma', 'Surya',
  'Tiara', 'Utami', 'Vivi', 'Wulan', 'Yanti', 'Zaki',
];

const LAST_NAMES = [
  'Pratama', 'Wijaya', 'Sari', 'Kusuma', 'Santoso', 'Hidayat',
  'Saputra', 'Rahayu', 'Nugroho', 'Wibowo', 'Susanto', 'Handayani',
  'Suryadi', 'Permana', 'Lestari', 'Setiawan', 'Fitriani', 'Ramadhan',
  'Adriansyah', 'Purnama',
];

function randomName(): string {
  const f = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${f} ${l}`;
}

function generateStudents(count: number): Student[] {
  return Array.from({ length: count }, (_, i) => {
    const responses = Array.from({ length: TOTAL_ITEMS }, () =>
      Math.random() > 0.45 ? 1 : 0
    );
    return {
      id: `STD-${String(i + 1).padStart(3, '0')}`,
      name: randomName(),
      responses,
      totalScore: responses.reduce((a, b) => a + b, 0),
    };
  });
}

function parseCSV(text: string): { students: Student[]; itemCount: number } | { error: string } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { error: 'CSV must have a header row and at least one data row.' };

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Detect response columns: any column header that is a number (1, 2, ... 140) or starts with "item"/"q"
  const nameIdx = header.findIndex(h => h === 'name' || h === 'student_name' || h === 'student');
  const idIdx = header.findIndex(h => h === 'id' || h === 'student_id' || h === 'nim');

  // Find response columns: numeric headers or item_N / q_N patterns
  const responseCols: number[] = [];
  header.forEach((h, i) => {
    if (/^\d+$/.test(h) || /^(item|q|question|soal)[_\s-]?\d+$/i.test(h)) {
      responseCols.push(i);
    }
  });

  // Fallback: if no response columns detected, assume all columns after id/name are responses
  if (responseCols.length === 0) {
    const startCol = Math.max(0, ...[idIdx, nameIdx].filter(i => i >= 0)) + 1;
    for (let i = startCol; i < header.length; i++) {
      responseCols.push(i);
    }
  }

  if (responseCols.length === 0) return { error: 'Could not detect response columns in CSV.' };

  const students: Student[] = [];
  const errors: string[] = [];

  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r].split(',').map(c => c.trim());
    if (cols.length < 2) continue;

    const responses = responseCols.map(ci => {
      const val = parseInt(cols[ci] ?? '0', 10);
      return val === 1 ? 1 : 0;
    });

    const name = nameIdx >= 0 ? cols[nameIdx] || `Student ${r}` : `Student ${r}`;
    const id = idIdx >= 0 ? cols[idIdx] || `STD-${String(r).padStart(3, '0')}` : `STD-${String(r).padStart(3, '0')}`;

    students.push({
      id,
      name,
      responses,
      totalScore: responses.reduce((a, b) => a + b, 0),
    });
  }

  if (students.length === 0) return { error: 'No valid student rows found.' };

  return { students, itemCount: responseCols.length };
}

function getPStatus(p: number): 'Difficult' | 'Moderate' | 'Easy' {
  if (p < 0.3) return 'Difficult';
  if (p <= 0.7) return 'Moderate';
  return 'Easy';
}

function getDStatus(d: number): 'Poor' | 'Satisfactory' | 'Good' | 'Excellent' {
  if (d <= 0.2) return 'Poor';
  if (d <= 0.4) return 'Satisfactory';
  if (d <= 0.7) return 'Good';
  return 'Excellent';
}

function analyzeItems(students: Student[], itemCount: number): ItemAnalysis[] {
  const sorted = [...students].sort((a, b) => b.totalScore - a.totalScore);
  const groupSize = Math.round(students.length * PERCENT_GROUP);
  const upper = sorted.slice(0, groupSize);
  const lower = sorted.slice(sorted.length - groupSize);

  return Array.from({ length: itemCount }, (_, i) => {
    const ba = upper.reduce((s, st) => s + (st.responses[i] ?? 0), 0);
    const bb = lower.reduce((s, st) => s + (st.responses[i] ?? 0), 0);
    const totalCorrect = students.reduce((s, st) => s + (st.responses[i] ?? 0), 0);
    const pIndex = totalCorrect / students.length;
    const dIndex = ba / groupSize - bb / groupSize;
    return {
      itemNumber: i + 1,
      ba,
      bb,
      totalCorrect,
      pIndex,
      pStatus: getPStatus(pIndex),
      dIndex,
      dStatus: getDStatus(dIndex),
    };
  });
}

function exportCSV(items: ItemAnalysis[]) {
  const header = 'Item,BA,BB,Total Correct,P-Index,P-Status,D-Index,D-Status';
  const rows = items.map(
    (r) =>
      `${r.itemNumber},${r.ba},${r.bb},${r.totalCorrect},${r.pIndex.toFixed(2)},${r.pStatus},${r.dIndex.toFixed(2)},${r.dStatus}`
  );
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'item_analysis_results.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Badge helpers ──────────────────────────────────────
const pBadge = (status: string) => {
  const map: Record<string, string> = {
    Difficult: 'bg-destructive/15 text-destructive border-destructive/30',
    Moderate: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
    Easy: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  };
  return map[status] ?? '';
};
const dBadge = (status: string) => {
  const map: Record<string, string> = {
    Poor: 'bg-destructive/15 text-destructive border-destructive/30',
    Satisfactory: 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30',
    Good: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    Excellent: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
  };
  return map[status] ?? '';
};

// ── Component ──────────────────────────────────────────
export default function ItemAnalysisDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [itemCount, setItemCount] = useState(TOTAL_ITEMS);
  const [dataSource, setDataSource] = useState<'mock' | 'csv' | null>(null);
  const [search, setSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = useCallback(() => {
    setItemCount(TOTAL_ITEMS);
    setStudents(generateStudents(100));
    setDataSource('mock');
  }, []);

  const handleCSVImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseCSV(text);
      if ('error' in result) {
        toast({ title: 'Import Error', description: result.error, variant: 'destructive' });
      } else {
        setItemCount(result.itemCount);
        setStudents(result.students);
        setDataSource('csv');
        toast({
          title: 'CSV Imported',
          description: `${result.students.length} students × ${result.itemCount} items loaded.`,
        });
      }
    };
    reader.readAsText(file);
    // Reset so same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const sorted = useMemo(
    () => [...students].sort((a, b) => b.totalScore - a.totalScore),
    [students]
  );

  const groupSize = Math.round(students.length * PERCENT_GROUP);

  const analysis = useMemo(
    () => (students.length > 0 ? analyzeItems(students, itemCount) : []),
    [students, itemCount]
  );

  const avgScore = useMemo(
    () =>
      students.length > 0
        ? (students.reduce((s, st) => s + st.totalScore, 0) / students.length).toFixed(1)
        : '0',
    [students]
  );

  const filteredStudents = useMemo(
    () =>
      sorted.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase())
      ),
    [sorted, search]
  );

  const filteredItems = useMemo(
    () =>
      analysis.filter((item) => {
        if (!itemSearch) return true;
        const n = parseInt(itemSearch);
        if (!isNaN(n)) return item.itemNumber === n;
        return item.pStatus.toLowerCase().includes(itemSearch.toLowerCase()) ||
          item.dStatus.toLowerCase().includes(itemSearch.toLowerCase());
      }),
    [analysis, itemSearch]
  );

  const classify = (rank: number) => {
    if (rank <= groupSize) return 'Upper';
    if (rank > students.length - groupSize) return 'Lower';
    return 'Middle';
  };

  const groupBadge = (g: string) => {
    if (g === 'Upper') return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
    if (g === 'Lower') return 'bg-destructive/15 text-destructive border-destructive/30';
    return 'bg-muted text-muted-foreground border-border';
  };

  const pSummary = useMemo(() => {
    if (!analysis.length) return { difficult: 0, moderate: 0, easy: 0 };
    return {
      difficult: analysis.filter((i) => i.pStatus === 'Difficult').length,
      moderate: analysis.filter((i) => i.pStatus === 'Moderate').length,
      easy: analysis.filter((i) => i.pStatus === 'Easy').length,
    };
  }, [analysis]);

  const dSummary = useMemo(() => {
    if (!analysis.length) return { poor: 0, satisfactory: 0, good: 0, excellent: 0 };
    return {
      poor: analysis.filter((i) => i.dStatus === 'Poor').length,
      satisfactory: analysis.filter((i) => i.dStatus === 'Satisfactory').length,
      good: analysis.filter((i) => i.dStatus === 'Good').length,
      excellent: analysis.filter((i) => i.dStatus === 'Excellent').length,
    };
  }, [analysis]);

  const handleClear = () => {
    setStudents([]);
    setDataSource(null);
    setItemCount(TOTAL_ITEMS);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleCSVImport}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight tracking-tight text-foreground sm:text-lg">
                Item Analysis Dashboard
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block">
                Classical Test Theory · 27% Upper/Lower Method
                {dataSource && (
                  <span className="ml-2">
                    · Source: <strong className="text-foreground">{dataSource === 'csv' ? 'CSV Import' : 'Mock Data'}</strong>
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {students.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear} className="gap-1.5 text-muted-foreground">
                <X size={14} /> Clear
              </Button>
            )}
            {analysis.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportCSV(analysis)}
                className="gap-1.5"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5">
              <Upload size={14} />
              <span className="hidden sm:inline">Import CSV</span>
            </Button>
            <Button size="sm" onClick={handleGenerate} className="gap-1.5">
              <Shuffle size={14} />
              <span className="hidden sm:inline">{students.length > 0 ? 'Regenerate' : 'Mock Data'}</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {students.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
              <BarChart3 className="text-accent-foreground" size={28} />
            </div>
            <h2 className="text-xl font-semibold text-foreground">No data yet</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Import a CSV file with real student response data, or generate mock data to explore the dashboard.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
              <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload size={16} /> Import CSV File
              </Button>
              <Button variant="outline" onClick={handleGenerate} className="gap-2">
                <Shuffle size={16} /> Generate Mock Data
              </Button>
            </div>

            {/* CSV format guide */}
            <Card className="mt-8 max-w-lg text-left">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText size={14} /> Expected CSV Format
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>Your CSV should have one row per student. The system auto-detects columns:</p>
                <div className="rounded-md bg-muted/60 p-3 font-mono text-[11px] leading-relaxed">
                  id,name,1,2,3,...,140<br />
                  STD-001,Andi Pratama,1,0,1,...,0<br />
                  STD-002,Budi Wijaya,0,1,1,...,1
                </div>
                <ul className="ml-4 list-disc space-y-1">
                  <li><strong>id</strong> and <strong>name</strong> columns are optional</li>
                  <li>Response columns: numbered headers (1, 2, …) or <code>item_1</code>, <code>q1</code>, etc.</li>
                  <li>Values: <code>1</code> = correct, <code>0</code> = incorrect</li>
                  <li>Any number of items is supported (not limited to 140)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="students" className="space-y-4">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="students" className="gap-1.5 text-xs sm:text-sm">
                <Users size={14} /> Student Overview
              </TabsTrigger>
              <TabsTrigger value="analysis" className="gap-1.5 text-xs sm:text-sm">
                <Target size={14} /> Item Analysis
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: Students ─────────────────── */}
            <TabsContent value="students" className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard icon={Users} label="Total Students" value={students.length} />
                <SummaryCard icon={ChevronUp} label="Upper Group" value={groupSize} accent="emerald" />
                <SummaryCard icon={ChevronDown} label="Lower Group" value={groupSize} accent="red" />
                <SummaryCard icon={GraduationCap} label="Avg Score" value={`${avgScore} / ${itemCount}`} />
              </div>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-base">Students Ranked by Score</CardTitle>
                  <div className="relative w-48">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[520px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow>
                          <TableHead className="w-16 text-center">Rank</TableHead>
                          <TableHead className="w-24">ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-24 text-center">Score</TableHead>
                          <TableHead className="w-24 text-center">Group</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((st, idx) => {
                          const rank = sorted.indexOf(st) + 1;
                          const group = classify(rank);
                          return (
                            <TableRow key={st.id} className="text-sm">
                              <TableCell className="text-center font-medium text-muted-foreground">
                                {rank}
                              </TableCell>
                              <TableCell className="font-mono text-xs">{st.id}</TableCell>
                              <TableCell>{st.name}</TableCell>
                              <TableCell className="text-center font-semibold">{st.totalScore}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className={groupBadge(group)}>
                                  {group}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB 2: Item Analysis ────────────── */}
            <TabsContent value="analysis" className="space-y-4">
              {/* Summary mini-cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                <MiniCard label="Items" value={itemCount} />
                <MiniCard label="Difficult" value={pSummary.difficult} color="text-destructive" />
                <MiniCard label="Moderate" value={pSummary.moderate} color="text-yellow-600" />
                <MiniCard label="Easy" value={pSummary.easy} color="text-emerald-600" />
                <MiniCard label="Poor D" value={dSummary.poor} color="text-destructive" />
                <MiniCard label="Good D" value={dSummary.good} color="text-blue-600" />
                <MiniCard label="Excellent D" value={dSummary.excellent} color="text-emerald-600" />
              </div>

              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-base">Item Analysis Results</CardTitle>
                    <CardDescription className="text-xs">
                      P = Facility · D = Discrimination (27% method)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-40">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Item # or status…"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportCSV(analysis)}
                      className="gap-1.5"
                    >
                      <Download size={14} /> Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[560px] overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-card">
                        <TableRow>
                          <TableHead className="w-20 text-center">Item #</TableHead>
                          <TableHead className="w-16 text-center">BA</TableHead>
                          <TableHead className="w-16 text-center">BB</TableHead>
                          <TableHead className="w-24 text-center">P-Index</TableHead>
                          <TableHead className="w-24 text-center">P-Status</TableHead>
                          <TableHead className="w-24 text-center">D-Index</TableHead>
                          <TableHead className="w-24 text-center">D-Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.itemNumber} className="text-sm">
                            <TableCell className="text-center font-medium">{item.itemNumber}</TableCell>
                            <TableCell className="text-center">{item.ba}</TableCell>
                            <TableCell className="text-center">{item.bb}</TableCell>
                            <TableCell className="text-center font-mono">
                              {item.pIndex.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={pBadge(item.pStatus)}>
                                {item.pStatus}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {item.dIndex.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={dBadge(item.dStatus)}>
                                {item.dStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────
function SummaryCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: string;
}) {
  const iconColor =
    accent === 'emerald'
      ? 'text-emerald-600'
      : accent === 'red'
        ? 'text-destructive'
        : 'text-primary';
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-lg bg-accent p-2 ${iconColor}`}>
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold leading-tight text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <Card>
      <CardContent className="px-3 py-2.5 text-center">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold ${color ?? 'text-foreground'}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
