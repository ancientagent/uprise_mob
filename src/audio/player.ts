import { Platform } from 'react-native';
import { TRACKPLAYER_ENABLED } from '../config/flags';

let TP: any = null;
try {
  TP = TRACKPLAYER_ENABLED ? require('react-native-track-player') : null;
} catch (e) {
  TP = null;
}

const noop = {
  setupPlayer: async () => ({ ok: false, reason: 'disabled' }),
  add: async () => {},
  play: async () => {},
  pause: async () => {},
  reset: async () => {},
  getState: async () => 'none',
};

export const Player = TP ? {
  setupPlayer: async () => { 
    await TP.default.setupPlayer({}); 
    return { ok: true }; 
  },
  add: async (tracks: any[]) => TP.default.add(tracks),
  play: async () => TP.default.play(),
  pause: async () => TP.default.pause(),
  reset: async () => TP.default.reset(),
  getState: async () => TP.default.getState(),
} : noop;

export const isPlayerEnabled = 
  !!TP && TRACKPLAYER_ENABLED && Platform.OS === 'android';