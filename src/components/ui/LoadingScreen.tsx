import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#030014] text-white">
      <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
      <p className="text-sm font-medium text-white/50 tracking-widest uppercase">
        Memuat Halaman...
      </p>
    </div>
  );
}
