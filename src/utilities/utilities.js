import Config from 'react-native-config';
import _ from 'lodash';

// eslint-disable-next-line import/no-unresolved
let DEV_FALLBACK = {};
try { DEV_FALLBACK = require('../config/dev_fallback').default || {}; } catch (_) {}

export const getStationBgColor = ['#B16D17', '#7BA0B2', '#AD7DD2', '#D1260E', '#DE5B11', '#D05798', '#3E1BCC', '#3B8D6F', '#F26157', '#DF8D26', '#80CED7', '#A54657', '#73956F', '#723D46', '#6461A0', '#7A3B69', '#2A628F', '#FFBA08', '#D4AFB9', '#216869'];

export const showminiPlayer = ['UserProfile', 'Discovery', 'Following', 'FollowersPage', 'OtherProfile', 'Uprises', 'AllTrendingSongs', 'AllPopularBands', 'FullGalleryView', 'FullEventView', 'AllBandSongs', 'AllBandList', 'BandDetails', 'Home'];

export const genrePreferencePieChartColor = ['rgba(248, 174, 76, 1)', 'rgba(55, 24, 180, 1)', 'rgba(165, 64, 118, 1)', 'rgba(254, 112, 0, 1)', 'rgba(252, 207, 85, 1)', 'rgba(253, 29, 5, 1)'];

export function getRequestURL(path) {
  const baseRaw = (Config.API_BASE_URL || DEV_FALLBACK.API_BASE_URL || '').trim();
  const p = String(path || DEV_FALLBACK.SIGNUP_URL /* generic default */ || '').trim();
  if (__DEV__) {
    try { 
      // eslint-disable-next-line no-console
      console.log('getRequestURL', { base: baseRaw, path: p }); 
    } catch (_) {}
  }
  // If base is still empty at runtime, fall back to common emulator default.
  const base = baseRaw || 'http://10.0.2.2:3000';
  if (!baseRaw) return p;
  if (base.endsWith('/') && p.startsWith('/')) return base + p.slice(1);
  if (!base.endsWith('/') && !p.startsWith('/')) return `${base}/${p}`;
  return base + p;
}

export function hasValue(value) {
  const isValuePresent = !(_.isNil(value)) && !(_.isEmpty(value));
  return isValuePresent && value.trim().length > 0;
}
