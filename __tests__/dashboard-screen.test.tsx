import { render, screen } from '@testing-library/react-native';

import DashboardScreen from '@/app/index';

describe('<DashboardScreen />', () => {
  it('위젯이 없으면 빈 상태 안내를 표시한다', async () => {
    await render(<DashboardScreen />);

    expect(screen.getByText('내 대시보드')).toBeTruthy();
    expect(screen.getByText('아직 위젯이 없습니다.')).toBeTruthy();
  });
});
