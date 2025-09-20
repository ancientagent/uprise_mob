import {
  call, put, takeLatest,
} from 'redux-saga/effects';
import AsyncStorage
from '@react-native-async-storage/async-storage';
import * as RootNavigation from '../../../navigators/RootNavigation';
import loginRequest from '../../../services/login/login.service';
import { loginReqSagaType } from '../../types/sagas';
import { loginRequestActions } from '../../actions/request/login/login.actions';
import showAlert from '../AlertUtility';
import { getUserDetailsSagaAction, registerDeviceTokenSagaAction } from '../../actions/sagas';
import { userAuthAction } from '../../actions/userAuth/userAuth.action';
import TokenService from '../../../utilities/TokenService';
import Config from 'react-native-config';

export default function* loginWatcherSaga() {
  yield takeLatest(loginReqSagaType, loginWorkerSaga);
}

export function* loginWorkerSaga(action) {
  yield put(loginRequestActions.start());
  try {
    const payload = {
      ...action.payload,
    };
    const response = yield call(loginRequest, payload);
    if (response !== null) {
      // Support both shapes: request.service returns res.data; some callers expect { data: ... }
      const resp = (response && response.data) ? response.data : response;
      const authDetails = {
        accessToken: resp?.accessToken,
        refreshToken: resp?.refreshToken,
      };
      yield put(loginRequestActions.succeed(resp));
      yield TokenService.setAccessToken(authDetails.accessToken);
      yield TokenService.setRefreshToken(authDetails.refreshToken);
      yield put(userAuthAction(authDetails));
      if (yield AsyncStorage.getItem('fcmToken') !== null) {
        yield put(registerDeviceTokenSagaAction({
          token: yield AsyncStorage.getItem('fcmToken'),
        }));
      }
      const status = resp?.user?.onBoardingStatus;

      // Consider either of these fields for determining if the user has a community:
      const hasCommunity =
        !!resp?.user?.primary?.community_key ||
        !!resp?.user?.community_key ||
        !!resp?.user?.communityKey;

      const forceEnvRaw = String((Config && Config.FORCE_DASHBOARD_AFTER_LOGIN) || '');
      const rawForce = forceEnvRaw.trim().toLowerCase();
      const truthyForce = ['true', '1', 'yes', 'y', 'on'];
      const falsyForce = ['false', '0', 'no', 'n', 'off'];
      let forceDashboard;
      if (truthyForce.includes(rawForce)) {
        forceDashboard = true;
      } else if (falsyForce.includes(rawForce)) {
        forceDashboard = false;
      } else {
        forceDashboard = false;
      }

      try {
        // eslint-disable-next-line no-console
        console.log('LOGIN route decision', {
          status,
          hasCommunity,
          forceEnv: forceEnvRaw,
          forceResolved: forceDashboard,
        });
      } catch (_) {}

      // Route: if fully onboarded (status === 2) AND hasCommunity → Dashboard
      // Otherwise → Home Scene Creation (CommunitySetup)
      if (forceDashboard || (status === 2 && hasCommunity)) {
        try {
          // eslint-disable-next-line no-console
          console.log('LOGIN nav → Dashboard', { forceDashboard, status, hasCommunity });
          RootNavigation.navigate('Dashboard');
        } catch (e) { try { console.log('LOGIN nav Dashboard error', e?.message || e); } catch (_) {} }
      } else {
        try {
          // eslint-disable-next-line no-console
          console.log('LOGIN nav → Auth/CommunitySetup', { forceDashboard, status, hasCommunity });
          RootNavigation.navigate('Auth', { screen: 'CommunitySetup', params: { fromLogin: true } });
        } catch (e) { try { console.log('LOGIN nav CommunitySetup error', e?.message || e); } catch (_) {} }
      }
    }
  } catch (e) {
    yield put(loginRequestActions.fail(e));
    yield call(showAlert, e.error);
  }
}





