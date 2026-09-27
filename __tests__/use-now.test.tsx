import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { TICK_MS, useNow } from '@/widgets/common/use-now';

function Clock() {
  const now = useNow();
  return <Text>{String(now)}</Text>;
}

/** 노드 참조는 다시 렌더되면 최신 값을 가리키므로 읽는 즉시 복사한다. */
function readClocks(): number[] {
  return screen.getAllByText(/\d+/).map((node) => Number(node.props.children));
}

describe('useNow (공용 타이머)', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('간격이 지나면 값이 갱신된다', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-27T12:00:00Z'));

    await render(<Clock />);
    const [before] = readClocks();

    await act(async () => {
      jest.advanceTimersByTime(TICK_MS);
    });

    const [after] = readClocks();
    expect(after).toBe(before + TICK_MS);
  });

  it('간격 이전에는 값이 그대로다', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-27T12:00:00Z'));

    await render(<Clock />);
    const [before] = readClocks();

    await act(async () => {
      jest.advanceTimersByTime(TICK_MS - 1000);
    });

    expect(readClocks()[0]).toBe(before);
  });

  it('위젯이 여러 개여도 같은 시각을 공유한다', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-27T12:00:00Z'));

    await render(
      <>
        <Clock />
        <Clock />
      </>,
    );
    const before = readClocks();
    expect(before[0]).toBe(before[1]);

    await act(async () => {
      jest.advanceTimersByTime(TICK_MS);
    });

    const after = readClocks();
    expect(after[0]).toBe(after[1]);
    expect(after[0]).toBe(before[0] + TICK_MS);
  });
});
