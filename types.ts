export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
}

export enum AppState {
  IDLE = 'IDLE',
  CAPTURING = 'CAPTURING', // Taking photo
  PREVIEW = 'PREVIEW', // Reviewing photo & entering prompt
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export type InputMethod = 'UPLOAD' | 'CAMERA';