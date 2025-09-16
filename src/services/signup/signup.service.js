import Config from 'react-native-config';
import { request } from '../request/request.service';
import {
  POST,
} from '../constants/Constants';
import { getRequestURL } from '../../utilities/utilities';

let DEV_FALLBACK = {}; 
try { DEV_FALLBACK = require('../../config/dev_fallback').default || {}; } catch (_) {}

export default async function signUpRequest(formData) {
  const endpoint = (Config.SIGNUP_URL || DEV_FALLBACK.SIGNUP_URL || '').trim();
  const requestOptions = {
    method: POST,
    data: formData,
    url: getRequestURL(endpoint),
  };
  return request(requestOptions)
    .then(response => response);
}
