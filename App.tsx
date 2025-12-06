import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { IntroModal } from './components/IntroModal';
import { Button } from './components/Button';
import { StatusLog } from './components/StatusLog';
import { VideoHUD } from './components/VideoHUD';
import { analyzeFrame } from './services/geminiService';
import { AppState, HistoryItem, AnalysisResult } from './types';

// Icons
const CameraIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const StopIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>;
const PlayIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const HelpIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const isProcessingRef = useRef(false);

  // Initialize Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setVideoStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setAppState(AppState.IDLE);
      setCameraError(null);
    } catch (err) {
      console.error("Camera Error:", err);
      setCameraError("Failed to access camera. Please allow permissions and ensure no other app is using it.");
      setAppState(AppState.ERROR);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setAppState(AppState.IDLE);
    setIsScanning(false);
  };

  // Capture Frame and Analyze
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isProcessingRef.current || !isScanning) return;

    isProcessingRef.current = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Draw current frame to canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const base64Image = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality for speed
      
      // Call Gemini API
      const result = await analyzeFrame(base64Image);
      
      setCurrentResult(result);
      isProcessingRef.current = false;

      // Update History if person detected
      if (result.isPersonDetected) {
        setHistory(prev => {
          const newItem: HistoryItem = { ...result, id: Date.now().toString() };
          // Keep last 50 items
          return [...prev, newItem].slice(-50); 
        });
      }
    } else {
        isProcessingRef.current = false;
    }
  }, [isScanning]);

  // Scanning Loop
  useEffect(() => {
    if (isScanning && appState !== AppState.ERROR) {
      // Analyze every 1 second (1000ms) to balance rate limits and "real-time" feel
      // Using window.setInterval to ensure correct type
      intervalRef.current = window.setInterval(captureAndAnalyze, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isProcessingRef.current = false;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isScanning, appState, captureAndAnalyze]);

  // Initial Permission Request handler
  const handleStartApp = () => {
    startCamera();
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col md:flex-row overflow-hidden relative">
      {/* Introduction Modal */}
      {appState === AppState.INTRO && <IntroModal onStart={handleStartApp} />}

      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Video Area */}
      <div className="flex-1 relative flex flex-col h-[50vh] md:h-screen bg-black border-r border-slate-800">
        {/* Header / Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
             <h2 className="text-2xl font-hud font-bold text-sky-500 tracking-widest">SENTIENT<span className="text-white">SCAN</span></h2>
             <div className="flex items-center gap-2 mt-1">
               <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></div>
               <span className="text-xs uppercase tracking-wide text-slate-400">
                 {isScanning ? 'System Active' : 'Standby'}
               </span>
             </div>
          </div>
          <button 
             onClick={() => setShowHelp(!showHelp)}
             className="pointer-events-auto p-2 bg-slate-800/80 rounded hover:bg-slate-700 text-sky-400 transition-colors"
          >
            <HelpIcon />
          </button>
        </div>

        {/* Video Feed */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900">
          {cameraError ? (
             <div className="text-center p-6 max-w-md">
                <div className="text-red-500 text-6xl mb-4 text-center mx-auto w-fit">⚠</div>
                <h3 className="text-xl font-bold text-white mb-2">Signal Lost</h3>
                <p className="text-red-400 mb-6">{cameraError}</p>
                <Button onClick={startCamera} variant="secondary">Retry Connection</Button>
             </div>
          ) : (
            <>
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover md:object-contain transform scale-x-[-1]" // Mirror effect
                onLoadedMetadata={() => videoRef.current?.play()}
              />
              {/* HUD Layer */}
              <VideoHUD isScanning={isScanning} result={currentResult} />
            </>
          )}
        </div>

        {/* Mobile-only Controls (Bottom overlay) */}
        <div className="md:hidden absolute bottom-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-30 flex justify-center gap-4">
           <Button 
              onClick={() => setIsScanning(!isScanning)} 
              variant={isScanning ? 'danger' : 'primary'}
              className="w-full shadow-lg"
              icon={isScanning ? <StopIcon /> : <PlayIcon />}
           >
             {isScanning ? 'Terminate Scan' : 'Initiate Scan'}
           </Button>
        </div>
      </div>

      {/* Sidebar / Control Panel (Desktop & Tablet) */}
      <div className="w-full md:w-96 bg-slate-950 border-l border-slate-800 flex flex-col h-[50vh] md:h-screen z-20 shadow-2xl">
        {/* Controls Section */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
           <h3 className="font-hud text-lg text-slate-400 mb-4 uppercase tracking-widest border-b border-slate-700 pb-2">
             Control Module
           </h3>
           
           <div className="space-y-4">
             <div className="flex gap-2">
               <Button 
                 onClick={() => setIsScanning(!isScanning)} 
                 variant={isScanning ? 'danger' : 'primary'}
                 className="flex-1"
                 disabled={!!cameraError}
                 icon={isScanning ? <StopIcon /> : <PlayIcon />}
               >
                 {isScanning ? 'Stop' : 'Start Scan'}
               </Button>
               
               <Button 
                 onClick={videoStream ? stopCamera : startCamera} 
                 variant="secondary"
                 icon={<CameraIcon />}
                 title="Toggle Camera"
               />
             </div>
             
             {/* Stats Panel */}
             <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                   <div className="text-xs text-slate-500 uppercase">Detection Status</div>
                   <div className={`text-lg font-bold font-hud ${currentResult?.isPersonDetected ? 'text-green-400' : 'text-slate-600'}`}>
                      {currentResult?.isPersonDetected ? 'SUBJECT FOUND' : 'SEARCHING'}
                   </div>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-800">
                   <div className="text-xs text-slate-500 uppercase">Latency</div>
                   <div className="text-lg font-bold font-hud text-sky-400">~1.2s</div>
                </div>
             </div>
           </div>
        </div>

        {/* Status Log */}
        <div className="flex-1 overflow-hidden p-4">
           <StatusLog history={history} />
        </div>
        
        {/* Footer */}
        <div className="p-2 text-center text-[10px] text-slate-600 border-t border-slate-800">
           SYS.VER.2.5.0 // GEMINI.FLASH // REACT
        </div>
      </div>

      {/* Help Modal Overlay */}
      {showHelp && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowHelp(false)}>
           <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-hud text-sky-400 mb-4 uppercase">System Manual</h3>
              <ul className="space-y-3 text-slate-300 text-sm">
                 <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">1.</span>
                    <span>Grant camera permissions when prompted.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">2.</span>
                    <span>Click <b>INITIATE SCAN</b> to begin AI analysis.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">3.</span>
                    <span>Ensure the subject is well-lit and visible.</span>
                 </li>
                 <li className="flex gap-2">
                    <span className="text-sky-500 font-bold">4.</span>
                    <span>The HUD will display the subject's emotion and action in real-time.</span>
                 </li>
              </ul>
              <div className="mt-6 flex justify-end">
                 <Button onClick={() => setShowHelp(false)} variant="outline">Close Manual</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
