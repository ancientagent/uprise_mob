import * as RootNavigation from './RootNavigation';

export const goToDashboard = () => {
  try { RootNavigation.navigate('Dashboard'); } catch (_) { /* noop */ }
};

export const goToCommunitySetup = (fromLogin = false) => {
  try { RootNavigation.navigate('Auth', { screen: 'CommunitySetup', params: { fromLogin } }); } catch (_) { /* noop */ }
};

export const goToAuthScreen = (screenName, params = {}) => {
  try { RootNavigation.navigate('Auth', { screen: screenName, params }); } catch (_) { /* noop */ }
};


