"use client";

import React, { useState, useEffect } from "react";
import { getAssembledModelBlob } from "@/lib/modelAssembly";

export default function Test3DPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [assembledSrc, setAssembledSrc] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const addLog = (msg: string, type: "info" | "error" | "success" = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] [${type.toUpperCase()}] ${msg}`]);
  };

  // 1. 核心：检查 Web Component 是否已经注册
  useEffect(() => {
    const checkComponent = () => {
      if (customElements.get('model-viewer')) {
        addLog("Model Viewer 已就绪 (Detected)", "success");
        setIsReady(true);
        return true;
      }
      return false;
    };

    if (!checkComponent()) {
      const timer = setInterval(() => {
        if (checkComponent()) clearInterval(timer);
      }, 500);
      return () => clearInterval(timer);
    }
  }, []);

  const testAssembly = async () => {
    setAssembledSrc(null);
    addLog("--- 开始执行组装 ---", "info");
    try {
      const blob = await getAssembledModelBlob({
        birdUrl: "/model/bird.glb",
        buildingUrl: "/model/cb.glb",
        buildingOffset: [0, 0, 0],
        wearables: [],
        cacheKey: "test-" + Date.now(),
      });
      addLog(`组装成功! 大小: ${(blob.size / 1024 / 1024).toFixed(2)}MB`, "success");
      setAssembledSrc(URL.createObjectURL(blob));
    } catch (e: any) {
      addLog(`组装失败: ${e.message}`, "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white font-mono">
      {/* 🌟 强制注入全局 CSS，防止高度塌陷 */}
      <style jsx global>{`
        model-viewer {
          display: block;
          width: 100%;
          height: 100%;
          background-color: #0f172a;
        }
      `}</style>

      <h1 className="text-xl font-bold mb-4 text-cyan-400">3D DEBUG CONSOLE</h1>

      {/* 日志窗口 */}
      <div className="bg-black/50 border border-white/10 p-4 rounded mb-6 h-40 overflow-y-auto text-xs">
        {logs.map((log, i) => (
          <div key={i} className={log.includes('ERROR') ? 'text-red-400' : log.includes('SUCCESS') ? 'text-green-400' : 'text-slate-400'}>
            {log}
          </div>
        ))}
      </div>

      <div className="flex gap-4 mb-8">
        <button 
          onClick={testAssembly}
          className="bg-cyan-600 px-6 py-2 rounded font-bold disabled:opacity-30"
          disabled={!isReady}
        >
          {isReady ? "RUN ASSEMBLY" : "WAITING FOR COMPONENT..."}
        </button>
      </div>

      {/* 渲染区域 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[400px]">
        <div className="border border-white/10 rounded overflow-hidden relative">
           <span className="absolute top-2 left-2 text-[10px] bg-black/50 px-2">BIRD</span>
           <model-viewer src="/model/bird.glb" camera-controls="true"></model-viewer>
        </div>
        <div className="border border-white/10 rounded overflow-hidden relative">
           <span className="absolute top-2 left-2 text-[10px] bg-black/50 px-2">CB</span>
           <model-viewer src="/model/cb.glb" camera-controls="true"></model-viewer>
        </div>
        <div className="border border-white/10 rounded overflow-hidden relative bg-cyan-900/10">
           <span className="absolute top-2 left-2 text-[10px] bg-cyan-500/50 px-2">RESULT</span>
           {assembledSrc && (
             <model-viewer src={assembledSrc} camera-controls="true" auto-rotate="true"></model-viewer>
           )}
        </div>
      </div>
    </div>
  );
}