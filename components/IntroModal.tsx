import React from 'react';
import { Button } from './Button';

interface IntroModalProps {
  onStart: () => void;
}

export const IntroModal: React.FC<IntroModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-sky-500/30 p-8 max-w-2xl w-full rounded-lg shadow-[0_0_50px_rgba(14,165,233,0.1)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent"></div>
        
        <h1 className="text-4xl md:text-5xl font-hud font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 mb-6 tracking-wide">
          SENTIENT SCAN
        </h1>
        
        <div className="space-y-6 text-slate-300 text-lg leading-relaxed">
          <p>
            Welcome to the advanced real-time emotion and action recognition system. 
            This application utilizes next-generation AI to analyze video feeds instantly.
          </p>
          
          <div className="bg-slate-800/50 p-6 rounded border-l-4 border-sky-500">
            <h3 className="text-sky-400 font-bold mb-3 uppercase tracking-wider text-sm">System Requirements</h3>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>Camera access is required for real-time analysis.</li>
              <li>A clear view of the subject ensures detection accuracy.</li>
              <li>Good lighting conditions improve AI confidence.</li>
            </ul>
          </div>
          
          <p className="text-sm text-slate-500 italic">
            Note: All processing is done via secure cloud API. No video is permanently stored.
          </p>
        </div>

        <div className="mt-10 flex justify-end">
          <Button onClick={onStart} className="w-full md:w-auto min-w-[200px] h-12 text-lg">
            Initialize System
          </Button>
        </div>
      </div>
    </div>
  );
};
