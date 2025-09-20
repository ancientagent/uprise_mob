import Config from 'react-native-config';
import { request } from '../request/request.service';
import {
  POST,
} from '../constants/Constants';
import { getRequestURL } from '../../utilities/utilities';

let DEV_FALLBACK = {}; 
try { DEV_FALLBACK = require('../../config/dev_fallback').default || {}; } catch (_) {}

export default function loginRequest(payload) {
  const endpoint = (Config.LOGIN_URL || DEV_FALLBACK.LOGIN_URL || '').trim();
  const requestOptions = {
    method: POST,
    data: JSON.stringify(payload),
    url: getRequestURL(endpoint),
  };
  return request(requestOptions)
    .then(response => response);
}
