import { Stack } from 'expo-router';

import { registerBuiltInWidgets } from '@/widgets';

registerBuiltInWidgets();

export default function RootLayout() {
  return <Stack screenOptions={{ title: 'Personal API Dashboard' }} />;
}
