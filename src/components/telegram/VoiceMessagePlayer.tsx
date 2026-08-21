import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  url?: string;
  durationSeconds?: number;
  isOutgoing?: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  durationSeconds = 15,
  isOutgoing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 100 / ((durationSeconds / playbackSpeed) * 10);
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, durationSeconds, playbackSpeed]);

  const cycleSpeed = () => {
    if (playbackSpeed === 1) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2);
    else setPlaybackSpeed(1);
  };

  const currentSeconds = Math.floor((progress / 100) * durationSeconds);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate simulated waveform bars
  const bars = [14, 28, 45, 70, 85, 60, 95, 40, 65, 80, 50, 90, 75, 40, 60, 30, 80, 95, 60, 40, 20];

  return (
    <div
      className={`flex items-center gap-3 py-1.5 px-3 rounded-2xl w-64 max-w-full select-none ${
        isOutgoing
          ? 'bg-sky-600/30 text-white'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
      }`}
    >
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm ${
          isOutgoing
            ? 'bg-white text-sky-600 hover:bg-neutral-100'
            : 'bg-sky-500 text-white hover:bg-sky-600'
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 min-w-0">
        {/* Waveform graphic */}
        <div className="flex items-center gap-0.5 h-6">
          {bars.map((height, i) => {
            const barProgress = (i / bars.length) * 100;
            const isFilled = progress >= barProgress;
            return (
              <div
                key={i}
                style={{ height: `${Math.max(15, height)}%` }}
                className={`w-1 rounded-full transition-colors ${
                  isFilled
                    ? isOutgoing
                      ? 'bg-white'
                      : 'bg-sky-500'
                    : isOutgoing
                    ? 'bg-sky-300/40'
                    : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
              />
            );
          })}
        </div>

        {/* Time display & Speed pill */}
        <div className="flex items-center justify-between text-[11px] font-mono mt-1 opacity-80">
          <span>{isPlaying ? formatTime(currentSeconds) : formatTime(durationSeconds)}</span>
          <button
            onClick={cycleSpeed}
            className="px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[10px] font-sans font-bold hover:opacity-100"
          >
            {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};
