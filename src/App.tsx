import React, { useState, useEffect } from 'react';
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

// --- 简化版卡片 ---
const ArtworkCard: React.FC<{ data: Artwork }> = ({ data }) => (
  <div className="relative w-full h-full bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
    {data.imageUrl ? (
      <img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            if (data.error) throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
            if (Array.isArray(data)) {
                if (data.length === 0) setDebugMsg("⚠️ 成功连上 Notion，但表格是空的 (请检查 Notion 数据)");
                setArtworks(data);
            } else {
                setDebugMsg("⚠️ 数据格式错误");
            }
        } catch (e: any) {
            setDebugMsg("⚠️ API 解析失败: " + e.message);
        }
      } catch (err: any) {
        setDebugMsg("⚠️ 网络请求失败: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white animate-pulse">正在加载画廊数据...</div>;

  if (debugMsg) return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white p-10">
      <div className="max-w-xl text-center border border-yellow-500/50 p-8 rounded-xl bg-yellow-900/20">
        <h2 className="text-xl font-bold text-yellow-500 mb-4">调试模式</h2>
        <p className="font-mono text-sm opacity-80">{debugMsg}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white p-8 flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {artworks.map(art => (
          <div key={art.id} className="aspect-[3/4]">
            <ArtworkCard data={art} />
          </div>
        ))}
      </div>
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
