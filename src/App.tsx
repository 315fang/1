import React, { useState, useEffect } from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- 工具函数 ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 兜底数据 (当 Notion 挂掉时显示) ---
const FALLBACK_ARTWORKS: Artwork[] = [
  {
    id: 101,
    title: "演示：赛博空间",
    enTitle: "Cyberspace Demo",
    imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    author: "演示数据",
    date: "2025",
    description: "检测到 API 连接异常，正在显示演示数据。",
    tags: ["Demo"]
  },
  {
    id: 102,
    title: "演示：静谧自然",
    enTitle: "Nature Silence",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    author: "演示数据",
    date: "2025",
    description: "请检查 Vercel 环境变量设置。",
    tags: ["Demo"]
  }
];

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

// --- 卡片组件 ---
const ArtworkCard: React.FC<{ data: Artwork }> = ({ data }) => (
  <div className="relative w-full aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer">
    {data.imageUrl ? (
      <img 
        src={data.imageUrl} 
        alt={data.title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
        onError={(e) => {
            // 图片加载失败时替换为占位图
            e.currentTarget.src = "https://via.placeholder.com/400x600?text=No+Image"; 
        }}
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center text-white/20 bg-gray-900">无图片</div>
    )}
    <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white translate-y-2 group-hover:translate-y-0 transition-transform">
      <h2 className="text-xl font-bold truncate">{data.title}</h2>
      <p className="opacity-70 text-sm truncate">{data.enTitle}</p>
      {data.author === "演示数据" && (
        <span className="inline-block mt-2 text-xs bg-red-500/80 px-2 py-0.5 rounded text-white">
          离线模式
        </span>
      )}
    </div>
  </div>
);

// --- 主程序 ---
function AppContent() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("开始请求 API...");
        // 增加 5 秒超时控制，避免 Vercel 函数冷启动时间过长导致页面假死
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch('/api/artworks', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const text = await res.text();
        // 尝试解析，防止返回 HTML (Vercel 404 页) 导致白屏
        try {
            const data = JSON.parse(text);
            if (data.error) throw new Error(data.error);
            if (Array.isArray(data) && data.length > 0) {
                setArtworks(data);
            } else {
                console.warn("API 返回空数组，使用兜底数据");
                throw new Error("Empty Data");
            }
        } catch (jsonErr) {
            console.error("JSON 解析失败:", text.slice(0, 100));
            throw new Error("Invalid JSON response");
        }
      } catch (err: any) {
        console.error("数据加载失败，切换至离线模式:", err);
        setIsOffline(true);
        setArtworks(FALLBACK_ARTWORKS);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 加载状态优化：显示骨架屏或 Loading 文字
  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[#050508] text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 w-8 bg-blue-500 rounded-full animate-bounce"></div>
            <p className="opacity-60 text-sm font-light tracking-widest">LOADING GALLERY...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 md:p-8 flex flex-col items-center">
      
      {/* 顶部状态栏 - 如果是离线模式提醒用户 */}
      {isOffline && (
        <div className="w-full max-w-6xl mb-6 bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center justify-between text-xs md:text-sm text-red-200">
          <span>⚠️ 无法连接 Notion 数据库，目前显示的是本地演示数据。</span>
          <span className="hidden md:inline opacity-50">请检查 Vercel 环境变量或 API 状态。</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-6xl">
        {artworks.map(art => (
          <ArtworkCard key={art.id} data={art} />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // 即使最外层崩溃，也显示黑底白字，而不是浏览器默认白屏
  return (
    <div className="bg-[#050508] min-h-screen">
       <AppContent />
    </div>
  );
}
