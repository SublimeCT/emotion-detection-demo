import React, { useRef, useEffect } from 'react';
import { HistoryItem } from '../types';

interface StatusLogProps {
  history: HistoryItem[];
}

export const StatusLog: React.FC<StatusLogProps> = ({ history }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
      <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-hud text-sky-400 font-bold tracking-wider uppercase">Detection Log</h3>
        <span className="text-xs text-slate-500">{history.length} records</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-2 scroll-smooth"
      >
        {history.length === 0 ? (
          <div className="text-slate-600 text-center text-sm py-10 italic">
            System waiting for data...
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-800/50 border border-slate-700/50 p-2 rounded text-sm hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                <span>{item.timestamp}</span>
                <span className={item.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}>
                  {item.confidence}% Conf.
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-xs text-slate-500 block">Emotion</span>
                  <span className="text-slate-200 font-medium">{item.emotion}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Action</span>
                  <span className="text-slate-200 font-medium">{item.action}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
