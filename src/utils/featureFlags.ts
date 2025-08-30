import { Platform } from 'react-native';
import ENV from './env';

export const isExpoGo = !!(global as any).ExpoGo;
export const safeMode = ENV.SAFE_MODE;
export const sttEnabled = ENV.ENABLE_STT && !isExpoGo; // disabilitato in Expo Go
export const voiceAvailable = sttEnabled && Platform.OS !== 'web';
