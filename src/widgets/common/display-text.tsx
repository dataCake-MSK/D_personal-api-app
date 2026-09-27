import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, type TextStyle } from 'react-native';

import { type TextDisplayConfig, scaledFontSize, toTextRenderProps } from './text-display';

type Props = {
  children: ReactNode;
  display: TextDisplayConfig;
  /** 테스트에서 컨테이너를 찾기 위한 식별자 */
  testID?: string;
  /** 기준 글자 크기(px). 글자 크기 설정의 배율이 적용된다. */
  baseSize: number;
  style?: TextStyle;
};

/** 표시 설정(줄바꿈·줄 수·넘침·글자 크기)을 적용해 텍스트를 그린다. */
export function DisplayText({ children, display, baseSize, style, testID }: Props) {
  const { numberOfLines, ellipsizeMode, horizontalScroll } = toTextRenderProps(display);
  const text = (
    <Text
      testID={horizontalScroll ? undefined : testID}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[{ fontSize: scaledFontSize(baseSize, display.fontScale) }, style]}
    >
      {children}
    </Text>
  );

  if (!horizontalScroll) return text;

  return (
    <ScrollView horizontal testID={testID} style={styles.scroll} {...horizontalScrollBarProps}>
      {text}
    </ScrollView>
  );
}

/**
 * 가로 스크롤이 가능하다는 것을 알 수 있게 얇은 스크롤바를 보여준다.
 * Android는 기본적으로 스크롤할 때만 나타나므로 항상 보이도록 둔다.
 */
export const horizontalScrollBarProps = {
  showsHorizontalScrollIndicator: true,
  persistentScrollbar: true,
  scrollIndicatorInsets: { bottom: 0 },
} as const;

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, paddingBottom: 4 },
});
