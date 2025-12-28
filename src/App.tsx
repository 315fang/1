import React, { useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, AnimatePresence, useTransform, useMotionTemplate, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, Info, ChevronLeft, ChevronRight, ArrowLeft, Maximize2, User, Mail, Instagram } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Lightbox from './components/Lightbox';

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- 类型定义 ---
interface Artwork {
    id: number;
    title: string;
    enTitle: string;
    imageUrl: string;
    author: string;
    date: string;
    description: string;
    tags: string[];
}

// --- 错误边界组件 (用于捕获白屏崩溃) ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-500 bg-black min-h-screen">
                    <h1 className="text-2xl font-bold mb-4">💥 发生严重错误 (前端崩溃)</h1>
                    <pre className="bg-red-900/20 p-4 rounded border border-red-500/50 overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

// 4.1 物理拉绳 (PullCord)
interface PullCordProps {
    side: 'left' | 'right';
    label: string;
    icon: React.ReactNode;
    y: any;
    onTrigger: () => void;
    isDark?: boolean;
}
const PullCord: React.FC<PullCordProps> = ({ side, label, icon, y, onTrigger, isDark = true }) => {
    const [triggered, setTriggered] = useState(false);
    const height = useTransform(y, (latest: number) => 100 + Math.max(0, latest));
    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.y > 80) {
            setTriggered(true); onTrigger(); setTimeout(() => setTriggered(false), 300);
        }
    };
    return (
        <div className={cn("absolute top-0 z-50 flex flex-col items-center pointer-events-auto", side === 'left' ? 'left-8' : 'right-8')}>
            <motion.div style={{ height }} className="absolute top-0 w-[1px] bg-white/50 origin-top z-0" />
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 150 }} onDragEnd={handleDragEnd} style={{ y }} className="relative z-10 mt-[100px]">
                <div className={cn("w-10 h-14 rounded-full border flex items-center justify-center backdrop-blur-md", isDark ? "border-white/20 bg-black/40 text-white" : "border-black/10 bg-white/60 text-black")}>
                    {icon}
                </div>
            </motion.div>
        </div>
    );
};

// 4.3 艺术卡片 (简单版防崩溃)
const ArtworkCard: React.FC<{ data: Artwork; isNight: boolean; isActive: boolean }> = ({ data, isNight, isActive }) => {
    // 保护性检查:防止 data 为空导致崩溃
    if (!data) return <div className="text-red-500">Error: Missing Data</div>;

    return (
        <div className={cn("w-full h-full relative rounded-xl overflow-hidden shadow-2xl", isNight ? "bg-slate-900" : "bg-white")}>
            <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-2xl font-light">{data.title}</h2>
                <p className="text-xs opacity-70">{data.enTitle}</p>
            </div>
        </div>
    );
};

// --- 主程序 (App) ---
function AppContent() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // 新增错误状态

  useEffect(() => {
    async function loadData() {
      try {
        console.log("开始请求 API...");
        const res = await fetch('/api/artworks');

        // 1. 检查 HTTP 状态
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API 请求失败: ${res.status} ${res.statusText} \n详情: ${errText}`);
        }

        const data = await res.json();
        console.log("API 返回数据:", data);

        // 2. 检查数据格式
        if (Array.isArray(data)) {
            if (data.length === 0) {
                setErrorMsg("API 返回了空数组 (Notion 表格可能为空，或筛选条件过严)");
            } else {
                setArtworks(data);
            }
        } else if (data.error) {
            throw new Error(`API 报错: ${data.error} - ${data.details || ''}`);
        } else {
            throw new Error("API 返回了无法识别的数据格式");
        }

      } catch (err: any) {
        console.error("加载流程出错:", err);
        setErrorMsg(err.message || "未知错误");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- 状态 1: 加载中 ---
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white flex-col gap-4">
        <div className="animate-pulse tracking-[0.5em] text-sm uppercase opacity-50">Loading Gallery...</div>
        <div className="text-xs text-white/30">正在连接 Notion API...</div>
      </div>
    );
  }

  // --- 状态 2: 发生错误 (显示在屏幕上) ---
  if (errorMsg) {
      return (
        <div className="flex h-screen w-full items-center justify-center bg-zinc-900 text-white p-8">
            <div className="max-w-2xl bg-red-950/30 border border-red-500/30 p-8 rounded-xl backdrop-blur-md">
                <h2 className="text-xl font-bold text-red-400 mb-4">⚠️ 出错了</h2>
                <p className="font-mono text-sm opacity-80 whitespace-pre-wrap">{errorMsg}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
                >
                    刷新重试
                </button>
            </div>
        </div>
      );
  }

  // --- 状态 3: 正常显示 ---
  return (
    <div className="min-h-screen w-full bg-[#050508] text-white flex items-center justify-center">
        {/* 这里是一个简化的列表，用来测试数据是否能显示 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 max-w-7xl">
            {artworks.map(art => (
                <div key={art.id} className="group relative aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden border border-white/10">
                    <img src={art.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 p-4 w-full bg-gradient-to-t from-black via-black/50 to-transparent">
                        <h3 className="text-lg font-bold">{art.title}</h3>
                        <p className="text-xs text-gray-300">{art.author}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* 调试信息 */}
        <div className="fixed bottom-4 left-4 text-[10px] text-white/20 font-mono">
            Loaded {artworks.length} items from Notion
        </div>
    </div>
  );
}

// 包装 App 以捕获渲染错误
export default function App() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}
