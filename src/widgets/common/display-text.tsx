import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, type TextStyle } from 'react-native';

import { type TextDisplayConfig, scaledFontSize, toTextRenderProps } from './text-display';

type Props = {
  children: ReactNode;
  display: TextDisplayConfig;
  /** 기준 글자 크기(px). 글자 크기 설정의 배율이 적용된다. */
  baseSize: number;
  style?: TextStyle;
};

/** 표시 설정(줄바꿈·줄 수·넘침·글자 크기)을 적용해 텍스트를 그린다. */
export function DisplayText({ children, display, baseSize, style }: Props) {
  const { numberOfLines, ellipsizeMode, horizontalScroll } = toTextRenderProps(display);
  const text = (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[{ fontSize: scaledFontSize(baseSize, display.fontScale) }, style]}
    >
      {children}
    </Text>
  );

  if (!horizontalScroll) return text;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {text}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
});
