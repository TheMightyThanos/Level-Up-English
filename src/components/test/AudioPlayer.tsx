import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  disableControls?: boolean;
}

export default function AudioPlayer({ src, title = 'Listening Audio', autoPlay = false, disableControls = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoaded = () => {
      setDuration(audio.duration);
      if (autoPlay) {
        audio.play().catch(() => {});
        setIsPlaying(true);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);

    // If metadata already loaded
    if (audio.readyState >= 1 && autoPlay && !isPlaying) {
      audio.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center gap-3">
        {!disableControls && (
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition flex-shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate mb-1.5">
            {title}
            {disableControls && (
              <span className="ml-2 text-xs text-muted-foreground">(Auto-play)</span>
            )}
          </p>
          <div
            className={`w-full h-2 bg-muted rounded-full ${disableControls ? '' : 'cursor-pointer'} group`}
            onClick={disableControls ? undefined : handleSeek}
          >
            <div
              className="h-full bg-primary rounded-full transition-all relative"
              style={{ width: `${progress}%` }}
            >
              {!disableControls && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition" />
              )}
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">{fmt(currentTime)}</span>
            <span className="text-[10px] text-muted-foreground">{duration ? fmt(duration) : '--:--'}</span>
          </div>
        </div>

        {!disableControls && (
          <button
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition flex-shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}
