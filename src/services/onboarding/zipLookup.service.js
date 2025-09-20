import Config from 'react-native-config';
import { GET } from '../constants/Constants';
import { request } from '../request/request.service';
import { getRequestURL } from '../../utilities/utilities';

// Looks up a ZIP code and returns { city, state }
// Tries API first (ZIP_LOOKUP_ENDPOINT), then falls back to a tiny local map for common dev zips.
export default async function getLocationFromZip(zip) {
  const z = String(zip || '').trim();
  if (!z || z.length < 5) return {};
  try {
    const endpoint = Config.ZIP_LOOKUP_ENDPOINT || '/geo/zip-lookup';
    const data = await request({ method: GET, url: getRequestURL(`${endpoint}?zip=${encodeURIComponent(z)}`) }, true);
    if (data) {
      // Prefer explicit fields { city, state_name/state }
      const city = data.city;
      const state = data.state || data.state_name;
      if (city && state) return { city, state };
      // Accept older dev-backend shape { location: { lat, lng } }
      if (data.location) return data.location;
      // Accept new shape { coords: { lat, lng } }
      if (data.coords) return data.coords;
    }
  } catch (_) { /* fall through */ }
  // Minimal local fallbacks for dev convenience
  const dev = {
    '78704': { city: 'Austin', state: 'Texas' },
    '78701': { city: 'Austin', state: 'Texas' },
    '78610': { city: 'Buda', state: 'Texas' },
    '10001': { city: 'New York', state: 'New York' },
  };
  return dev[z] || {};
}
