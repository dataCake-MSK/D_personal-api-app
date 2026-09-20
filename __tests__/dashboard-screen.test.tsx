import { fireEvent, render, screen } from '@testing-library/react-native';

import { useDashboardStore } from '@/features/dashboard/store';
import DashboardScreen from '@/app/index';
import { clearWidgetRegistry } from '@/widgets/registry';
import { registerBuiltInWidgets } from '@/widgets';

beforeEach(() => {
  clearWidgetRegistry();
  registerBuiltInWidgets();
  useDashboardStore.setState({ widgets: [] });
});

async function addTextWidget(text: string, title?: string) {
  await fireEvent.press(screen.getByText('+ 위젯 추가'));
  await fireEvent.press(screen.getByText('텍스트'));
  if (title !== undefined) {
    await fireEvent.changeText(screen.getByPlaceholderText('예: 서버 상태'), title);
  }
  await fireEvent.changeText(screen.getByPlaceholderText('표시할 문구'), text);
  await fireEvent.press(screen.getByText('추가'));
}

describe('<DashboardScreen />', () => {
  it('위젯이 없으면 빈 상태 안내를 표시한다', async () => {
    await render(<DashboardScreen />);

    expect(screen.getByText('내 대시보드')).toBeTruthy();
    expect(screen.getByText('아직 위젯이 없습니다.')).toBeTruthy();
  });

  it('위젯을 추가하면 화면과 저장소에 반영된다', async () => {
    await render(<DashboardScreen />);

    await addTextWidget('서버 정상', '상태');

    expect(screen.getByText('상태')).toBeTruthy();
    expect(screen.getByText('서버 정상')).toBeTruthy();
    expect(screen.queryByText('아직 위젯이 없습니다.')).toBeNull();
    expect(useDashboardStore.getState().widgets).toHaveLength(1);
  });

  it('필수 설정이 비어 있으면 추가되지 않고 오류를 표시한다', async () => {
    await render(<DashboardScreen />);

    await fireEvent.press(screen.getByText('+ 위젯 추가'));
    await fireEvent.press(screen.getByText('텍스트'));
    await fireEvent.press(screen.getByText('추가'));

    expect(useDashboardStore.getState().widgets).toHaveLength(0);
    expect(screen.getByText(/자|문자|최소|at least|Too small/i)).toBeTruthy();
  });

  it('위젯을 삭제하면 화면과 저장소에서 사라진다', async () => {
    await render(<DashboardScreen />);
    await addTextWidget('지울 위젯');

    await fireEvent.press(screen.getByText('삭제'));

    expect(screen.queryByText('지울 위젯')).toBeNull();
    expect(useDashboardStore.getState().widgets).toHaveLength(0);
    expect(screen.getByText('아직 위젯이 없습니다.')).toBeTruthy();
  });

  it('위아래 이동이 화면 순서와 저장소에 반영된다', async () => {
    await render(<DashboardScreen />);
    await addTextWidget('첫째');
    await addTextWidget('둘째');

    // 두 번째 위젯의 "위로" 버튼 (첫 번째 위젯은 비활성)
    await fireEvent.press(screen.getAllByText('위로')[1]);

    expect(useDashboardStore.getState().widgets.map((w) => w.config)).toEqual([
      { text: '둘째' },
      { text: '첫째' },
    ]);

    await fireEvent.press(screen.getAllByText('아래로')[0]);

    expect(useDashboardStore.getState().widgets.map((w) => w.config)).toEqual([
      { text: '첫째' },
      { text: '둘째' },
    ]);
  });
});
