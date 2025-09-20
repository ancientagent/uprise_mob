import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();
const pendingNav = [];

function normalizeArgs(name, params) {
  if (typeof name === 'object' && name !== null && !Array.isArray(name)) {
    return [name];
  }
  return [name, params];
}

function flushPending() {
  if (!navigationRef.isReady()) return;
  try { if (__DEV__) { /* eslint-disable no-console */ console.log('RootNavigation.flushPending', pendingNav.length); } } catch (_) {}
  while (pendingNav.length) {
    const args = pendingNav.shift();
    try {
      if (__DEV__) { /* eslint-disable no-console */ console.log('RootNavigation.navigate(pending)', ...args); }
      navigationRef.navigate(...args);
    } catch (_) { /* noop */ }
  }
}

export function navigate(name, params) {
  const args = normalizeArgs(name, params);
  try {
    if (__DEV__) { /* eslint-disable no-console */ console.log('RootNavigation.navigate', ...args); }
  } catch (_) {}
  if (navigationRef.isReady()) {
    try { navigationRef.navigate(...args); } catch (_) { /* noop */ }
  } else {
    pendingNav.push(args);
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
  try { if (__DEV__) { /* eslint-disable no-console */ console.log('RootNavigation.onNavReady'); } } catch (_) {}
  flushPending();
}

// Strong reset to nested Auth -> CommunitySetup to avoid stack ambiguity
export function resetToAuthCommunitySetup(params = {}) {
  try {
    const state = {
      index: 0,
      routes: [
        {
          name: 'Auth',
          state: {
            index: 0,
            routes: [ { name: 'CommunitySetup', params } ],
          },
        },
      ],
    };
    if (__DEV__) { /* eslint-disable no-console */ console.log('RootNavigation.resetToAuthCommunitySetup'); }
    navigationRef.resetRoot(state);
  } catch (_) { /* noop */ }
}

export function resetTo(name, params) {
  try { if (__DEV__) { /* eslint-disable no-console */ console.log('[nav] resetTo ->', name, params || null); } } catch (_) {}
  try {
    navigationRef.resetRoot({ index: 0, routes: [{ name, params }] });
  } catch (_) { /* noop */ }
}

export function resetToNested(parent, child, childParams) {
  try { if (__DEV__) { /* eslint-disable no-console */ console.log('[nav] resetToNested ->', parent, '>', child, childParams || null); } } catch (_) {}
  try {
    navigationRef.resetRoot({
      index: 0,
      routes: [
        { name: parent, state: { index: 0, routes: [{ name: child, params: childParams }] } },
      ],
    });
  } catch (_) { /* noop */ }
}
