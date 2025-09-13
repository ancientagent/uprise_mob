import Config from 'react-native-config';
import { request } from '../request/request.service';
import { GET } from '../constants/Constants';
import { getRequestURL } from '../../utilities/utilities';

// Fetch super genres for onboarding (community-forming categories)
export default function getSuperGenresRequest(payload = {}) {
  const endpoint = Config.ONBOARDING_SUPER_GENRES || '/onboarding/super-genres';
  const requestOptions = {
    method: GET,
    url: getRequestURL(endpoint),
    headers: payload.accessToken ? { Authorization: `Bearer ${payload.accessToken}` } : {},
  };
  return request(requestOptions).then(response => response);
}

