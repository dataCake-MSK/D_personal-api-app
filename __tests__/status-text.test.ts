import { buildStatusText } from '@/widgets/common/status-text';

const NOW = new Date('2026-09-27T12:00:00Z').getTime();

describe('카드 상태 문구', () => {
  it('불러오는 중에는 진행 상태만 보여준다', () => {
    expect(
      buildStatusText({ updatedAt: NOW, refreshSeconds: 60, isFetching: true, now: NOW }),
    ).toBe('갱신 중…');
  });

  it('수동일 때는 "수동"을 함께 보여준다', () => {
    expect(
      buildStatusText({ updatedAt: NOW, refreshSeconds: 0, isFetching: false, now: NOW }),
    ).toBe('방금 갱신 · 수동');
  });

  it('시간이 지나면 경과 시간이 바뀐다', () => {
    const threeMinutesLater = NOW + 3 * 60_000;

    expect(
      buildStatusText({
        updatedAt: NOW,
        refreshSeconds: 0,
        isFetching: false,
        now: threeMinutesLater,
      }),
    ).toBe('3분 전 갱신 · 수동');
  });

  it('자동 갱신 주기를 함께 보여준다', () => {
    expect(
      buildStatusText({ updatedAt: NOW, refreshSeconds: 300, isFetching: false, now: NOW }),
    ).toBe('방금 갱신 · 5분마다');
  });

  it('아직 받은 적이 없으면 모드만 보여준다', () => {
    expect(
      buildStatusText({ updatedAt: undefined, refreshSeconds: 0, isFetching: false, now: NOW }),
    ).toBe('수동');
    expect(buildStatusText({ updatedAt: 0, refreshSeconds: 30, isFetching: false, now: NOW })).toBe(
      '30초마다',
    );
  });
});
