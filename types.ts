export interface AnalysisResult {
  emotion: string;
  action: string;
  isPersonDetected: boolean;
  confidence: number;
  timestamp: string;
  location?: 'left' | 'center' | 'right';
}

export interface HistoryItem extends AnalysisResult {
  id: string;
}

export enum AppState {
  INTRO = 'INTRO',
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  ERROR = 'ERROR'
}

export interface CameraConfig {
  facingMode: 'user' | 'environment';
}
