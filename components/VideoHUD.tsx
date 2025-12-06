import React from 'react';
import { AnalysisResult } from '../types';

interface VideoHUDProps {
  isScanning: boolean;
  result: AnalysisResult | null;
}

export const VideoHUD: React.FC<VideoHUDProps> = ({ isScanning, result }) => {
  // Determine position of the label based on AI result
  let positionClass = "left-1/2 -translate-x-1/2"; // Default center
  if (result?.location === 'left') positionClass = "left-10";
  if (result?.location === 'right') positionClass = "right-10";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Decorative HUD Corners */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-sky-500/50 rounded-tl-lg"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-sky-500/50 rounded-tr-lg"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-sky-500/50 rounded-bl-lg"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-sky-500/50 rounded-br-lg"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      {/* Scanning Line */}
      {isScanning && (
        <div className="absolute left-0 right-0 h-1 bg-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.8)] animate-scan z-10"></div>
      )}

      {/* Result Label / Reticle */}
      {result && result.isPersonDetected && (
        <div className={`absolute top-1/3 ${positionClass} transition-all duration-500 ease-out z-20`}>
          <div className="relative">
            {/* Target Reticle */}
            <div className="w-[300px] h-[200px] border border-sky-400/60 bg-sky-900/20 backdrop-blur-sm relative animate-pulse-slow">
              {/* Corner markers */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-sky-400"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-sky-400"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-sky-400"></div>
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-sky-400"></div>
              
              {/* Data Content */}
              <div className="absolute -top-12 left-0 w-full flex flex-col gap-1">
                 <div className="flex items-center gap-2">
                    <span className="bg-sky-600 text-white text-xs px-2 py-0.5 font-hud font-bold">TARGET LOCKED</span>
                    <span className="text-sky-400 font-mono text-xs">{result.timestamp}</span>
                 </div>
              </div>

              <div className="flex flex-col justify-end h-full p-4">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-sky-500/30 pb-1">
                        <span className="text-sky-300 font-hud uppercase text-sm tracking-wider">Emotion</span>
                        <span className="text-white font-bold text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{result.emotion}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sky-300 font-hud uppercase text-sm tracking-wider">Action</span>
                        <span className="text-white font-bold text-lg drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{result.action}</span>
                    </div>
                 </div>
              </div>
            </div>
            
            {/* Connecting line to center (optional decorative) */}
            <div className="absolute top-full left-1/2 w-[1px] h-20 bg-gradient-to-b from-sky-400/50 to-transparent"></div>
          </div>
        </div>
      )}

      {/* No Person Warning */}
      {result && !result.isPersonDetected && isScanning && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-900/50 border border-red-500/50 p-4 rounded backdrop-blur-md">
            <span className="text-red-400 font-hud font-bold text-xl uppercase tracking-widest animate-pulse">
                Searching for Subject...
            </span>
        </div>
      )}
    </div>
  );
};
