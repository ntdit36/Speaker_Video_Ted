import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VideoClip } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Gauge, 
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize2,
  AlertTriangle
} from 'lucide-react';

interface YouTubePlayerProps {
  clip: VideoClip;
  clipIndex: number;
  totalClips: number;
  onPrevClip: () => void;
  onNextClip: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onTimeUpdate?: (currentTime: number) => void;
  seekTime?: number | null;
  onSeekHandled?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  clip,
  clipIndex,
  totalClips,
  onPrevClip,
  onNextClip,
  isLooping,
  onToggleLoop,
  playbackSpeed,
  onChangeSpeed,
  onTimeUpdate,
  seekTime,
  onSeekHandled,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(clip.startSecond);
  const [duration, setDuration] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState<boolean>(false);

  const isTransitioningRef = useRef<boolean>(true);

  // Reset error & anchor time immediately when clip changes
  useEffect(() => {
    setHasError(false);
    isTransitioningRef.current = true;
    setCurrentTime(clip.startSecond);
    if (onTimeUpdate) {
      onTimeUpdate(clip.startSecond);
    }
  }, [clip.id, clip.youtubeId, clip.startSecond]);

  // Initialize or update YouTube Player
  useEffect(() => {
    let checkInterval: any = null;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        try {
          setHasError(false);
          isTransitioningRef.current = true;
          playerRef.current.loadVideoById({
            videoId: clip.youtubeId,
            startSeconds: Math.max(0, clip.startSecond),
          });
          playerRef.current.setPlaybackRate(playbackSpeed);
          setIsPlaying(true);
        } catch {
          // If loadVideoById fails, recreate player
        }
        return;
      }

      try {
        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId: clip.youtubeId,
          playerVars: {
            autoplay: 1,
            start: Math.max(0, clip.startSecond),
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            fs: 1,
            origin: window.location.origin,
            cc_lang_pref: 'en',
            hl: 'en',
          },
          events: {
            onReady: (event: any) => {
              setPlayerReady(true);
              setHasError(false);
              event.target.setPlaybackRate(playbackSpeed);
              event.target.seekTo(Math.max(0, clip.startSecond), true);
              event.target.playVideo();
              setIsPlaying(true);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setHasError(false);
                const t = event.target.getCurrentTime ? event.target.getCurrentTime() : 0;
                if (t >= clip.startSecond - 1.2) {
                  isTransitioningRef.current = false;
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                if (isLooping) {
                  replaySentence();
                } else if (clipIndex < totalClips - 1) {
                  onNextClip();
                }
              }
            },
            onError: (event: any) => {
              console.warn('YouTube Player error code:', event.data, 'for ID:', clip.youtubeId);
              setHasError(true);
              setIsPlaying(false);
              // Auto-advance to next video if embedding is blocked
              setTimeout(() => {
                if (clipIndex < totalClips - 1) {
                  onNextClip();
                }
              }, 2000);
            },
          },
        });
      } catch (err) {
        console.error('Error initializing YouTube player:', err);
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => initPlayer();
    } else {
      initPlayer();
    }

    // Interval to monitor loop and current time with ultra-high responsiveness (50ms)
    checkInterval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const current = playerRef.current.getCurrentTime();

          // Guard against false 0 readings while player is buffering or seeking to startSecond
          if (clip.startSecond > 1.5 && isTransitioningRef.current) {
            if (current >= clip.startSecond - 1.2) {
              isTransitioningRef.current = false;
            } else {
              // Ignore buffering 0 time so subtitles do not flash line 0
              return;
            }
          }

          setCurrentTime(current);
          if (onTimeUpdate) onTimeUpdate(current);

          if (typeof playerRef.current.getDuration === 'function') {
            setDuration(playerRef.current.getDuration());
          }

          // If loop is on, check if we passed endSecond
          if (isLooping && clip.endSecond && current >= clip.endSecond) {
            playerRef.current.seekTo(Math.max(0, clip.startSecond), true);
          }
        } catch {
          // ignore error
        }
      }
    }, 50);

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [clip.id, clip.youtubeId, clip.startSecond, isLooping]);

  // Handle external seek requests
  useEffect(() => {
    if (seekTime !== undefined && seekTime !== null && playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(seekTime, true);
        playerRef.current.playVideo();
        setIsPlaying(true);
        if (onSeekHandled) onSeekHandled();
      } catch (err) {
        console.error(err);
      }
    }
  }, [seekTime, onSeekHandled]);

  // Adjust playback rate when changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      try {
        playerRef.current.setPlaybackRate(playbackSpeed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const replaySentence = useCallback(() => {
    if (!playerRef.current) return;
    try {
      const seekTarget = Math.max(0, clip.startSecond);
      playerRef.current.seekTo(seekTarget, true);
      playerRef.current.playVideo();
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    }
  }, [clip.startSecond]);

  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5];

  const totalVideoDuration = duration > 0 ? duration : Math.max(clip.durationSeconds || 0, clip.endSecond + 60, 180);

  const handleVideoTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || typeof playerRef.current.seekTo !== 'function') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetSec = clickRatio * totalVideoDuration;
    playerRef.current.seekTo(targetSec, true);
    playerRef.current.playVideo();
    setIsPlaying(true);
    setCurrentTime(targetSec);
    if (onTimeUpdate) onTimeUpdate(targetSec);
  };

  return (
    <div ref={containerRef} className="w-full bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800">
      {/* Top Video Header: Clip count & Channel info */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-400 tabular-nums">
            Clip {clipIndex + 1} of {totalClips}
          </span>
          <span className="text-slate-600">|</span>
          <span className="truncate max-w-[200px] sm:max-w-xs font-medium text-slate-200">
            {clip.channel}
          </span>
          {clip.views && (
            <span className="hidden md:inline text-slate-400">
              · {clip.views}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px] tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration || clip.endSecond + 60)}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${clip.youtubeId}&t=${Math.floor(clip.startSecond)}s`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            title="Open on YouTube"
          >
            <span className="hidden sm:inline">YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Video Container Aspect Ratio 16:9 */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center">
        <div id={playerIdRef.current} className="w-full h-full" />
        
        {/* Loading overlay if not ready yet */}
        {!playerReady && !hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-2">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Cueing exact timestamp ({clip.startSecond}s)...</p>
          </div>
        )}

        {/* Embedding Error Overlay with Auto-Skip */}
        {hasError && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              Video này giới hạn quyền nhúng trực tiếp
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              Chủ sở hữu kênh YouTube cài đặt chặn phát trên web bên ngoài. Đang tự động chuyển sang video tiếp theo...
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onNextClip}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Bỏ qua &amp; Xem clip tiếp theo</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${clip.youtubeId}&t=${Math.floor(clip.startSecond)}s`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Mở trên YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Whole-Video Real-time Scrubber Bar */}
      <div 
        onClick={handleVideoTimelineClick}
        className="relative w-full h-2.5 bg-slate-800 hover:h-3.5 transition-all cursor-pointer group select-none border-t border-slate-800"
        title="Tua video theo toàn bộ thời lượng (Nhấp bất kỳ điểm nào để phát)"
      >
        {/* Target sentence highlight pill in entire video timeline */}
        {totalVideoDuration > 0 && clip.startSecond >= 0 && (
          <div
            className="absolute top-0 bottom-0 bg-amber-400/50 hover:bg-amber-400/70 border-x border-amber-300 z-5 transition-colors"
            style={{
              left: `${Math.max(0, Math.min(100, (clip.startSecond / totalVideoDuration) * 100))}%`,
              width: `${Math.max(1.5, Math.min(100, ((clip.endSecond - clip.startSecond) / totalVideoDuration) * 100))}%`,
            }}
            title={`🎯 Đoạn chứa từ "${clip.targetWord}": ${formatTime(clip.startSecond)} - ${formatTime(clip.endSecond)}`}
          />
        )}

        {/* Current playback progress fill */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-100 ease-linear"
          style={{ width: `${Math.min(100, Math.max(0, (currentTime / (totalVideoDuration || 1)) * 100))}%` }}
        />

        {/* Playhead handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 -ml-1.5 w-3 h-3 bg-white border-2 border-amber-500 rounded-full shadow-md group-hover:scale-125 transition-transform z-10 pointer-events-none"
          style={{ left: `${Math.min(100, Math.max(0, (currentTime / (totalVideoDuration || 1)) * 100))}%` }}
        />
      </div>

      {/* Control Deck Bar */}
      <div className="p-3 bg-slate-950 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
        {/* Navigation / Clip Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Previous Clip */}
          <button
            onClick={onPrevClip}
            disabled={clipIndex === 0}
            className={`p-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors ${
              clipIndex === 0
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95'
            }`}
            title="Previous clip (Left Arrow)"
          >
            <SkipBack className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Replay Sentence */}
          <button
            onClick={replaySentence}
            className="p-2 px-3 rounded-lg font-medium text-xs flex items-center gap-1.5 text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-colors"
            title="Replay sentence (Key: R)"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Replay</span>
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="p-2 px-4 rounded-lg font-semibold text-xs flex items-center gap-1.5 text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-colors shadow-sm"
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Next Clip */}
          <button
            onClick={onNextClip}
            disabled={clipIndex >= totalClips - 1}
            className={`p-2 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors ${
              clipIndex >= totalClips - 1
                ? 'text-slate-600 bg-slate-900 cursor-not-allowed'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95'
            }`}
            title="Next clip (Right Arrow)"
          >
            <span className="hidden sm:inline">Next</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Practice Utilities & Speed controls */}
        <div className="flex items-center gap-2">
          {/* Loop Current Sentence */}
          <button
            onClick={onToggleLoop}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isLooping
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Loop this sentence repeatedly for pronunciation practice (Key: L)"
          >
            <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin' : ''}`} />
            <span>Loop {isLooping ? 'ON' : 'OFF'}</span>
          </button>

          {/* Speed Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSpeedMenuOpen(!speedMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              title="Playback speed"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>{playbackSpeed}x</span>
            </button>

            {speedMenuOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-28 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                <div className="px-2 py-1 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Speed</div>
                {speedOptions.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      onChangeSpeed(speed);
                      setSpeedMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      playbackSpeed === speed
                        ? 'bg-amber-400/20 text-amber-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{speed}x</span>
                    {playbackSpeed === speed && <span className="text-[10px]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen button */}
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors hidden sm:block"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
