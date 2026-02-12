import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Disc } from 'lucide-react';
import { cn } from '../utils/cn';
import { useAppControl } from '../contexts/AppControlContext';

interface Song {
    id: number;
    title: string;
    artist: string;
    url: string;
    cover?: string;
}

interface MusicPlayerProps {
    isNight: boolean;
    playlist?: Song[];
}

// 默认歌单（可以从后端获取或自定义）
const defaultPlaylist: Song[] = [
    {
        id: 1,
        title: '告白气球',
        artist: '周杰伦',
        url: 'https://music.163.com/song/media/outer/url?id=418602084.mp3',
        cover: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg'
    },
    {
        id: 2,
        title: '晴天',
        artist: '周杰伦',
        url: 'https://music.163.com/song/media/outer/url?id=186016.mp3',
        cover: 'https://p2.music.126.net/a2HtXFWYpH2LnMmiOjUrHQ==/109951163309846424.jpg'
    }
];

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ isNight, playlist = [] }) => {
    const { music, registerMusicControls, setMusicIndex } = useAppControl();

    // Local state for UI only (expanded, volume)
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isPlayingLocal, setIsPlayingLocal] = useState(false); // Sync with audio element
    const [volume, setVolume] = useState(0.5);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false); // Keep isMuted local

    // Sync context index
    const currentIndex = music.currentIndex;
    const currentSong = playlist[currentIndex];

    // Register controls to Context on mount/update
    useEffect(() => {
        registerMusicControls({
            isPlaying: isPlayingLocal,
            togglePlay: () => togglePlay(),
            nextSong: () => nextSong(),
            prevSong: () => prevSong()
        });
    }, [isPlayingLocal, currentIndex, playlist]); // Dependencies for closure freshness

    // Vinyl rotation animation
    const vinylRotate = {
        animate: { rotate: 360 },
        transition: { repeat: Infinity, duration: 3, ease: "linear" }
    };

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlayingLocal) {
            audioRef.current.pause();
            setIsPlayingLocal(false);
        } else {
            audioRef.current.play().catch(() => { }); // Handle auto-play block
            setIsPlayingLocal(true);
        }
    };

    const nextSong = () => {
        const next = (currentIndex + 1) % playlist.length;
        setMusicIndex(next);
        // Auto play handled by useEffect on currentSong change
    };

    const prevSong = () => {
        const prev = (currentIndex - 1 + playlist.length) % playlist.length;
        setMusicIndex(prev);
    };

    // Auto-play when song index changes (if it was playing or initiated by user)
    useEffect(() => {
        if (audioRef.current && isPlayingLocal) {
            audioRef.current.play().catch(() => { });
        }
    }, [currentIndex]);

    // 切换静音
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    // 调整音量
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
        if (newVolume === 0) {
            setIsMuted(true);
        } else if (isMuted) {
            setIsMuted(false);
        }
    };

    // 进度更新
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress(audio.currentTime);
            setDuration(audio.duration || 0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', updateProgress);
        audio.addEventListener('ended', nextSong);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', updateProgress);
            audio.removeEventListener('ended', nextSong);
        };
    }, [currentIndex]);

    // 格式化时间
    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // 点击进度条跳转
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || !audioRef.current) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioRef.current.currentTime = percent * duration;
    };

    if (playlist.length === 0) return null;

    return (
        <>
            {/* 隐藏的 Audio 元素 */}
            <audio
                ref={audioRef}
                src={currentSong?.url}
            />

            {/* 播放器容器 */}
            <div className="fixed bottom-6 left-6 z-[100]">
                {/* 展开的播放器 */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className={`absolute bottom-16 left-0 w-72 rounded-2xl shadow-2xl overflow-hidden ${isNight
                                ? 'bg-zinc-900/95 border border-white/10'
                                : 'bg-white/95 border border-slate-200'
                                } backdrop-blur-xl`}
                        >
                            {/* Cover Art / Vinyl */}
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                <motion.div
                                    className={cn(
                                        "w-full h-full rounded-full overflow-hidden shadow-2xl border-4",
                                        isNight ? "border-zinc-800" : "border-white"
                                    )}
                                    animate={isPlayingLocal ? vinylRotate.animate : { rotate: 0 }}
                                    transition={isPlayingLocal ? vinylRotate.transition : { duration: 0.5 }}
                                >
                                    <img
                                        src={currentSong?.cover || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60"}
                                        alt="Album Cover"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 rounded-full border-[3px] border-black/10" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full z-10" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-black rounded-full z-20" />
                                </motion.div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* 歌曲信息 */}
                                <div className="absolute bottom-3 left-4 right-4">
                                    <h3 className="text-white font-medium truncate">{currentSong.title}</h3>
                                    <p className="text-white/60 text-sm truncate">{currentSong.artist}</p>
                                </div>
                            </div>

                            {/* 控制区域 */}
                            <div className="p-4">
                                {/* 进度条 */}
                                <div
                                    ref={progressBarRef}
                                    onClick={handleProgressClick}
                                    className={`relative h-1 rounded-full mb-2 cursor-pointer ${isNight ? 'bg-white/10' : 'bg-slate-200'
                                        }`}
                                >
                                    <motion.div
                                        className={`absolute h-full rounded-full ${isNight ? 'bg-amber-500' : 'bg-pink-500'
                                            }`}
                                        style={{ width: `${(progress / duration) * 100 || 0}%` }}
                                    />
                                </div>

                                {/* 时间显示 */}
                                <div className={`flex justify-between text-xs mb-3 ${isNight ? 'text-white/40' : 'text-slate-400'
                                    }`}>
                                    <span>{formatTime(progress)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>

                                {/* 控制按钮 */}
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={prevSong}
                                        className={`p-2 rounded-full transition-colors ${isNight ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <SkipBack size={20} />
                                    </button>
                                    <button
                                        onClick={togglePlay}
                                        className={`p-4 rounded-full shadow-lg transform active:scale-95 transition-all ${isNight
                                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
                                            : 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                                            }`}
                                    >
                                        {isPlayingLocal ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                    </button>
                                    <button
                                        onClick={nextSong}
                                        className={`p-2 rounded-full transition-colors ${isNight ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <SkipForward size={20} />
                                    </button>
                                </div>

                                {/* 音量控制 */}
                                <div className="flex items-center gap-2 mt-4">
                                    <button
                                        onClick={toggleMute}
                                        className={`p-1 ${isNight ? 'text-white/60' : 'text-slate-600'}`}
                                    >
                                        {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                    </button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className={`flex-1 h-1 rounded-full appearance-none cursor-pointer ${isNight ? 'bg-white/10' : 'bg-slate-200'
                                            }`}
                                        style={{
                                            background: `linear-gradient(to right, ${isNight ? '#f59e0b' : '#ec4899'} ${(isMuted ? 0 : volume) * 100}%, ${isNight ? 'rgba(255,255,255,0.1)' : '#e2e8f0'} ${(isMuted ? 0 : volume) * 100}%)`
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 迷你按钮 */}
            </div>

            {/* 3. 迷你播放条 */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsExpanded(true)}
                className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-md transition-all ${isNight
                    ? 'bg-zinc-800/80 text-white border border-white/10 hover:bg-zinc-800'
                    : 'bg-white/80 text-slate-800 border border-white/40 hover:bg-white'
                    }`}
            >
            </motion.button>
        </>
    );
};

export default MusicPlayer;
