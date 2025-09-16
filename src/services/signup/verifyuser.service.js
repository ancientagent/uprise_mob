import Config from 'react-native-config';
import { request } from '../request/request.service';
import {
  POST,
} from '../constants/Constants';
import { getRequestURL } from '../../utilities/utilities';

let DEV_FALLBACK = {}; 
try { DEV_FALLBACK = require('../../config/dev_fallback').default || {}; } catch (_) {}

export default function verifyUserRequest(payload) {
  const endpoint = (Config.VERIFY_USER || DEV_FALLBACK.VERIFY_USER || '').trim();
  const requestOptions = {
    method: POST,
    data: JSON.stringify(payload),
    url: getRequestURL(endpoint),
  };
  return request(requestOptions)
    .then(response => response);
}
