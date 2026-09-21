import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

import { registerBuiltInWidgets } from '@/widgets';

registerBuiltInWidgets();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 화면마다 제목을 달리해 어디에 있는지, 어디로 돌아가는지 알 수 있게 한다. */}
      <Stack>
        <Stack.Screen name="index" options={{ title: '내 대시보드' }} />
        <Stack.Screen
          name="secrets"
          options={{ title: 'API 키 관리', headerBackTitle: '대시보드' }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
