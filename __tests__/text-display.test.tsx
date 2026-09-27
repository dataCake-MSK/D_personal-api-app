import { fireEvent, render, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { DisplayText } from '@/widgets/common/display-text';
import {
  DEFAULT_TEXT_DISPLAY,
  resolveTextDisplay,
  scaledFontSize,
  toTextRenderProps,
} from '@/widgets/common/text-display';
import { TextDisplayEditor } from '@/widgets/common/text-display-editor';

describe('표시 설정 해석', () => {
  it('설정이 없으면 기본값을 쓴다 (기존 위젯 호환)', () => {
    expect(resolveTextDisplay(undefined)).toEqual(DEFAULT_TEXT_DISPLAY);
    expect(resolveTextDisplay({ title: '제목만 있는 기존 설정' })).toEqual(DEFAULT_TEXT_DISPLAY);
  });

  it('일부만 지정하면 나머지는 기본값으로 채운다', () => {
    expect(resolveTextDisplay({ fontScale: 'large' })).toEqual({
      ...DEFAULT_TEXT_DISPLAY,
      fontScale: 'large',
    });
  });
});

describe('글자 크기 계산', () => {
  it('배율을 적용해 반올림한다', () => {
    expect(scaledFontSize(16, 'small')).toBe(14);
    expect(scaledFontSize(16, 'medium')).toBe(16);
    expect(scaledFontSize(16, 'large')).toBe(21);
  });
});

describe('텍스트 렌더 옵션', () => {
  it('줄바꿈을 켜고 줄 수를 제한하지 않으면 제한이 없다', () => {
    expect(toTextRenderProps({ ...DEFAULT_TEXT_DISPLAY })).toEqual({
      numberOfLines: undefined,
      ellipsizeMode: undefined,
      horizontalScroll: false,
    });
  });

  it('최대 줄 수를 지정하면 말줄임과 함께 적용된다', () => {
    expect(toTextRenderProps({ ...DEFAULT_TEXT_DISPLAY, maxLines: 2 })).toEqual({
      numberOfLines: 2,
      ellipsizeMode: 'tail',
      horizontalScroll: false,
    });
  });

  it('줄바꿈을 끄면 한 줄로 말줄임한다', () => {
    expect(toTextRenderProps({ ...DEFAULT_TEXT_DISPLAY, wrap: false })).toEqual({
      numberOfLines: 1,
      ellipsizeMode: 'tail',
      horizontalScroll: false,
    });
  });

  it('줄바꿈을 끄고 가로 스크롤을 고르면 스크롤로 보여준다', () => {
    expect(toTextRenderProps({ ...DEFAULT_TEXT_DISPLAY, wrap: false, overflow: 'scroll' })).toEqual(
      { numberOfLines: 1, horizontalScroll: true },
    );
  });
});

describe('<DisplayText />', () => {
  it('글자 크기와 줄 수를 적용한다', async () => {
    await render(
      <DisplayText
        display={{ ...DEFAULT_TEXT_DISPLAY, fontScale: 'large', maxLines: 2 }}
        baseSize={16}
      >
        긴 내용
      </DisplayText>,
    );

    const text = screen.getByText('긴 내용');
    expect(text.props.numberOfLines).toBe(2);
    expect(text.props.style.flat().find((s: { fontSize?: number }) => s?.fontSize)).toEqual({
      fontSize: 21,
    });
  });
});

function EditorHarness() {
  const [config, setConfig] = useState<Record<string, unknown>>({});
  return (
    <>
      <TextDisplayEditor value={config} onChange={setConfig} />
      <DisplayText display={resolveTextDisplay(config)} baseSize={16}>
        미리보기
      </DisplayText>
    </>
  );
}

describe('<TextDisplayEditor />', () => {
  it('글자 크기를 고르면 반영된다', async () => {
    await render(<EditorHarness />);

    await fireEvent.press(screen.getByText('크게'));

    expect(screen.getByText('미리보기').props.style.flat()).toEqual(
      expect.arrayContaining([{ fontSize: 21 }]),
    );
  });

  it('줄바꿈을 끄면 넘침 처리 선택이 나온다', async () => {
    await render(<EditorHarness />);

    expect(screen.getByText('최대 줄 수 (0 = 제한 없음)')).toBeTruthy();

    await fireEvent.press(screen.getByText('☑ 긴 내용 줄바꿈'));

    expect(screen.getByText('한 줄에 넘칠 때')).toBeTruthy();
    expect(screen.getByText('가로 스크롤')).toBeTruthy();
  });

  it('최대 줄 수는 숫자만 받고 20을 넘지 않는다', async () => {
    await render(<EditorHarness />);

    const input = screen.getByPlaceholderText('0');
    await fireEvent.changeText(input, '3a');
    expect(screen.getByText('미리보기').props.numberOfLines).toBe(3);

    await fireEvent.changeText(input, '99');
    expect(screen.getByText('미리보기').props.numberOfLines).toBe(20);
  });
});
