import { focusManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

/**
 * 앱이 다시 활성화되면 오래된 데이터를 갱신하도록 TanStack Query에 알린다.
 * 웹에서는 브라우저 기본 처리가 있으므로 연결하지 않는다.
 */
export function startAppFocusTracking(): () => void {
  if (Platform.OS === 'web') return () => {};

  const subscription = AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });

  return () => subscription.remove();
}
