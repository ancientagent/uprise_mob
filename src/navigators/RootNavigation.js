
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
const pendingNav = [];

function flushPending() {
  if (!navigationRef.isReady()) return;
  while (pendingNav.length) {
    const { name, params } = pendingNav.shift();
    try { navigationRef.navigate(name, params); } catch (_) { /* noop */ }
  }
}

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    pendingNav.push({ name, params });
    setTimeout(flushPending, 50);
  }
}
export function goBack() {
  navigationRef.current?.goBack();
}

export function getRootState() {
  return navigationRef.current.getCurrentRoute().name;
}

export function resetRoot() {
  return navigationRef.resetRoot({
    index: 0,
    key: null,
    routes: [{ name: 'Dashboard' }],
  });
}

export function onNavReady() {
  flushPending();
}
