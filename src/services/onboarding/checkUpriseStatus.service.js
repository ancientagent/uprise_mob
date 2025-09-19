import { GET, POST } from '../constants/Constants';
import { request } from '../request/request.service';
import { getRequestURL } from '../../utilities/utilities';
import Config from 'react-native-config';

// Checks if a given (city,state,genre) uprise is active and returns a normalized shape
// { active: boolean, songCount?: number, needed?: number, nearestActive?, alternatives?, primary? }
export default async function checkUpriseStatus({ city, state, genre, accessToken } = {}) {
  const endpoint = Config.ONBOARDING_VALIDATE_COMMUNITY || '/onboarding/validate-community';
  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  try {
    const res = await request({ method: POST, url: getRequestURL(endpoint), headers, data: JSON.stringify({ city, state, subGenre: genre }) });
    if (res && typeof res === 'object') return res;
  } catch (_) {
    try {
      const res = await request({ method: GET, url: getRequestURL(endpoint), headers, params: { city, state, sub_genre: genre } });
      if (res && typeof res === 'object') return res;
    } catch (_) { /* noop */ }
  }
  return { active: false };
}

