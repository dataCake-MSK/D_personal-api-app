import AsyncStorage from '@react-native-async-storage/async-storage';

import { DASHBOARD_STORAGE_KEY, useDashboardStore } from '@/features/dashboard/store';

/** persist 미들웨어의 저장은 비동기라 다음 틱까지 기다린다. */
const flushStorageWrite = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  await AsyncStorage.clear();
  useDashboardStore.setState({ widgets: [] });
});

describe('대시보드 저장소', () => {
  it('위젯을 추가하면 목록 끝에 붙는다', () => {
    const { addWidget } = useDashboardStore.getState();

    addWidget('text', { text: '첫 번째' });
    addWidget('text', { text: '두 번째' });

    const { widgets } = useDashboardStore.getState();
    expect(widgets).toHaveLength(2);
    expect(widgets[1].config).toEqual({ text: '두 번째' });
    expect(widgets[0].id).not.toEqual(widgets[1].id);
  });

  it('위젯을 삭제한다', () => {
    const widget = useDashboardStore.getState().addWidget('text');

    useDashboardStore.getState().removeWidget(widget.id);

    expect(useDashboardStore.getState().widgets).toHaveLength(0);
  });

  it('위젯 순서를 위아래로 바꾼다', () => {
    const first = useDashboardStore.getState().addWidget('text', { text: 'A' });
    const second = useDashboardStore.getState().addWidget('text', { text: 'B' });

    useDashboardStore.getState().moveWidget(second.id, 'up');
    expect(useDashboardStore.getState().widgets.map((w) => w.id)).toEqual([second.id, first.id]);

    useDashboardStore.getState().moveWidget(second.id, 'down');
    expect(useDashboardStore.getState().widgets.map((w) => w.id)).toEqual([first.id, second.id]);
  });

  it('목록 끝에서 더 이동시켜도 순서가 그대로다', () => {
    const only = useDashboardStore.getState().addWidget('text');

    useDashboardStore.getState().moveWidget(only.id, 'up');
    useDashboardStore.getState().moveWidget(only.id, 'down');

    expect(useDashboardStore.getState().widgets.map((w) => w.id)).toEqual([only.id]);
  });

  it('위젯 설정을 수정한다', () => {
    const widget = useDashboardStore.getState().addWidget('text', { text: '이전' });

    useDashboardStore.getState().updateWidgetConfig(widget.id, { text: '이후' });

    expect(useDashboardStore.getState().widgets[0].config).toEqual({ text: '이후' });
  });

  it('앱을 다시 켜면 저장된 구성이 복원된다', async () => {
    useDashboardStore.getState().addWidget('text', { text: '유지될 위젯' });
    await flushStorageWrite();

    const saved = await AsyncStorage.getItem(DASHBOARD_STORAGE_KEY);
    expect(saved).toContain('유지될 위젯');

    // 앱 재시작: 메모리 상태는 비어 있고, 저장소에는 종료 시점 내용이 남아 있다
    useDashboardStore.setState({ widgets: [] });
    await flushStorageWrite();
    await AsyncStorage.setItem(DASHBOARD_STORAGE_KEY, saved as string);

    await useDashboardStore.persist.rehydrate();

    const { widgets } = useDashboardStore.getState();
    expect(widgets).toHaveLength(1);
    expect(widgets[0].config).toEqual({ text: '유지될 위젯' });
  });
});
