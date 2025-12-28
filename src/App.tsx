import React, { useState, useEffect, useMemo } from 'react';
import { motion, useSpring, useTransform, useMotionValue, AnimatePresence, useMotionTemplate, PanInfo } from 'framer-motion';
import { Sun, Moon, Sparkles, Info, ChevronLeft, ChevronRight, ArrowLeft, Grid, Maximize2, User, Mail, Instagram } from 'lucide-react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 错误边界 (防白屏护盾) ---
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-10 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold mb-4">💥 网页崩溃了</h1>
          <p className="mb-4">请截图发给 AI 助手：</p>
          <pre className="bg-black/50 p-4 rounded text-sm overflow-auto max-w-2xl border border-red-400">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
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

// --- 简化版组件 (确保不出错) ---
const ArtworkCard: React.FC<{ data: Artwork; isActive: boolean }> = ({ data }) => (
  <div className="relative w-full h-full bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/10">
    {data.imageUrl ? (
      <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-white/20">无图片</div>
    )}
    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent text-white">
      <h2 className="text-2xl font-bold">{data.title}</h2>
      <p className="opacity-70">{data.enTitle}</p>
    </div>
  </div>
);

// --- 主程序 ---
function AppContent() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/artworks');
        const text = await res.text(); // 先按文本读取，防止 JSON 解析挂掉

        try {
            const data = JSON.parse(text);
            if (data.error) throw new Error(data.error);

            if (Array.isArray(data)) {
                console.log("成功获取数据:", data);
                if (data.length === 0) setDebugMsg("⚠️ API 返回了空数组 (Notion 表格是空的?)");
                setArtworks(data);
            } else {
                setDebugMsg("⚠️ 数据格式不对: " + JSON.stringify(data).slice(0, 100));
            }
        } catch (e) {
            setDebugMsg("⚠️ JSON 解析失败 (API 可能报错了): " + text.slice(0, 200));
        }
      } catch (err: any) {
        setDebugMsg("⚠️ 网络请求失败: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-black text-white">
      <div className="animate-pulse">Loading Gallery...</div>
    </div>
  );

  // 如果有错误信息，直接显示出来
  if (debugMsg) return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white p-10">
      <div className="max-w-xl text-center border border-yellow-500/50 p-8 rounded-xl bg-yellow-900/20">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">调试信息</h2>
        <p className="font-mono text-sm opacity-80">{debugMsg}</p>
      </div>
    </div>
  );

  // 正常显示画廊
  return (
    <div className="min-h-screen bg-[#050508] text-white p-8 flex items-center justify-center">
      {artworks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          {artworks.map(art => (
            <div key={art.id} className="aspect-[3/4]">
              <ArtworkCard data={art} isActive={true} />
            </div>
          ))}
        </div>
      ) : (
        <div className="opacity-50">画廊里还没有作品，请去 Notion 添加一行数据。</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
