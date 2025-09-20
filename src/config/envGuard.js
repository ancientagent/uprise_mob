import { Alert } from 'react-native';
import Config from 'react-native-config';

export function assertEnv(required = []) {
  if (!__DEV__) return;
  const missing = required.filter(k => !String(Config[k] || '').trim());
  if (!missing.length) return;
  // Always log for developer visibility
  // eslint-disable-next-line no-console
  console.log('ENV MISSING', { missing, Config });

  // Only interrupt with a modal if STRICT_ENV=true|1 explicitly set.
  const strict = String(Config.STRICT_ENV || '').toLowerCase();
  const isStrict = strict === 'true' || strict === '1';
  if (isStrict) {
    try {
      Alert.alert(
        'Config Missing (Debug)',
        `These keys are empty:\n${missing.join('\n')}\n\nCheck .env.development and rebuild.`,
      );
    } catch (_) {}
  }
}

export default { assertEnv };
