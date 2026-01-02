import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';

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

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isNight, playlist = defaultPlaylist }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    const currentSong = playlist[currentIndex];

    // 处理播放/暂停
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.log('Playback failed:', e));
        }
        setIsPlaying(!isPlaying);
    };

    // 上一曲
    const prevSong = () => {
        setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    };

    // 下一曲
    const nextSong = () => {
        setCurrentIndex(prev => (prev + 1) % playlist.length);
    };

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

    // 切换歌曲时自动播放
    useEffect(() => {
        if (audioRef.current && isPlaying) {
            audioRef.current.play().catch(e => console.log('Auto-play failed:', e));
        }
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
                            {/* 封面区域 */}
                            <div className="relative h-32 overflow-hidden">
                                {currentSong.cover ? (
                                    <img
                                        src={currentSong.cover}
                                        alt={currentSong.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center ${isNight ? 'bg-zinc-800' : 'bg-slate-200'
                                        }`}>
                                        <Music size={40} className="opacity-30" />
                                    </div>
                                )}
                                {/* 渐变遮罩 */}
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
                                        className={`p-3 rounded-full ${isNight
                                            ? 'bg-amber-500 text-black hover:bg-amber-400'
                                            : 'bg-pink-500 text-white hover:bg-pink-600'
                                            }`}
                                    >
                                        {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
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
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${isNight
                        ? 'bg-zinc-800 border border-white/10 text-amber-400'
                        : 'bg-white border border-slate-200 text-pink-500'
                        }`}
                >
                    {/* 音浪动画 */}
                    {isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                            {[1, 2, 3].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: [8, 16, 8],
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.1,
                                        ease: "easeInOut"
                                    }}
                                    className={`w-1 rounded-full ${isNight ? 'bg-amber-400' : 'bg-pink-500'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {!isPlaying && <Music size={24} />}

                    {/* 展开/收起指示 */}
                    <motion.div
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                        style={{
                            background: isNight ? '#f59e0b' : '#ec4899'
                        }}
                    >
                        {isExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                    </motion.div>
                </motion.button>
            </div>
        </>
    );
};

export default MusicPlayer;
