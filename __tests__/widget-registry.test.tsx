import { render, screen } from '@testing-library/react-native';

import {
  clearWidgetRegistry,
  getWidgetDefinition,
  listWidgetDefinitions,
} from '@/widgets/registry';
import { registerBuiltInWidgets, WidgetCard } from '@/widgets';

beforeEach(() => {
  clearWidgetRegistry();
  registerBuiltInWidgets();
});

describe('위젯 레지스트리', () => {
  it('기본 위젯이 등록된다', () => {
    expect(listWidgetDefinitions().map((d) => d.type)).toEqual(['text']);
    expect(getWidgetDefinition('text')?.label).toBe('텍스트');
    expect(getWidgetDefinition('없는타입')).toBeUndefined();
  });
});

describe('<WidgetCard />', () => {
  it('Text 위젯을 그린다', async () => {
    await render(
      <WidgetCard widget={{ id: 'w1', type: 'text', config: { title: '메모', text: '안녕' } }} />,
    );

    expect(screen.getByText('메모')).toBeTruthy();
    expect(screen.getByText('안녕')).toBeTruthy();
  });

  it('등록되지 않은 타입은 오류 카드로 표시한다', async () => {
    await render(<WidgetCard widget={{ id: 'w2', type: 'chart', config: {} }} />);

    expect(screen.getByText('알 수 없는 위젯')).toBeTruthy();
    expect(screen.getByText(/등록되지 않은 위젯 종류입니다: chart/)).toBeTruthy();
  });

  it('설정이 스키마에 맞지 않으면 검증 실패 메시지를 표시한다', async () => {
    await render(<WidgetCard widget={{ id: 'w3', type: 'text', config: { text: '' } }} />);

    expect(screen.getByText('텍스트 설정 오류')).toBeTruthy();
    expect(screen.getByText(/^text:/m)).toBeTruthy();
  });

  it('한 위젯의 오류가 다른 위젯 렌더링을 막지 않는다', async () => {
    await render(
      <>
        <WidgetCard widget={{ id: 'w4', type: 'chart', config: {} }} />
        <WidgetCard widget={{ id: 'w5', type: 'text', config: { text: '정상 위젯' } }} />
      </>,
    );

    expect(screen.getByText('알 수 없는 위젯')).toBeTruthy();
    expect(screen.getByText('정상 위젯')).toBeTruthy();
  });
});
