import { thinLabels, toChartPoints } from '@/widgets/http-json/timeseries';

describe('시계열 변환', () => {
  it('숫자 배열과 시간 배열을 짝지어 점으로 만든다', () => {
    const points = toChartPoints([21.4, 22.1, 20.8], {}, [
      '2026-09-20T00:00',
      '2026-09-20T01:00',
      '2026-09-20T02:00',
    ]);

    expect(points).toEqual([
      { value: 21.4, label: '00:00' },
      { value: 22.1, label: '01:00' },
      { value: 20.8, label: '02:00' },
    ]);
  });

  it('객체 배열은 지정한 필드로 값과 라벨을 꺼낸다', () => {
    const points = toChartPoints(
      [
        { date: '2026-09-01', price: 1000 },
        { date: '2026-09-02', price: 1200 },
      ],
      { xField: 'date', yField: 'price' },
    );

    expect(points).toEqual([
      { value: 1000, label: '09-01' },
      { value: 1200, label: '09-02' },
    ]);
  });

  it('긴 문자열 라벨은 줄여서 보여준다', () => {
    expect(
      toChartPoints([{ name: 'very-long-label-value', v: 3 }], { xField: 'name', yField: 'v' }),
    ).toEqual([{ value: 3, label: 'very-lo…' }]);
  });

  it('지정한 필드가 없는 객체는 건너뛴다', () => {
    expect(toChartPoints([{ other: 1 }], { yField: 'price' })).toEqual([]);
  });

  it('숫자로 읽을 수 있는 문자열도 값으로 쓴다', () => {
    expect(toChartPoints(['1', '2.5'])).toEqual([
      { value: 1, label: undefined },
      { value: 2.5, label: undefined },
    ]);
  });

  it('숫자가 아닌 항목은 건너뛴다', () => {
    expect(toChartPoints([1, null, 'abc', 3])).toEqual([
      { value: 1, label: undefined },
      { value: 3, label: undefined },
    ]);
  });

  it('배열이 아니면 빈 배열', () => {
    expect(toChartPoints({ a: 1 })).toEqual([]);
    expect(toChartPoints(undefined)).toEqual([]);
  });

  it('점이 많으면 라벨을 솎아낸다', () => {
    const points = Array.from({ length: 24 }, (_, index) => ({
      value: index,
      label: `${index}시`,
    }));

    const thinned = thinLabels(points, 6);

    expect(thinned).toHaveLength(24);
    expect(thinned.filter((point) => point.label !== undefined)).toHaveLength(6);
    expect(thinned[0].label).toBe('0시');
  });

  it('점이 적으면 라벨을 그대로 둔다', () => {
    const points = [
      { value: 1, label: 'a' },
      { value: 2, label: 'b' },
    ];

    expect(thinLabels(points, 6)).toEqual(points);
  });
});
