import { z } from 'zod';

/** 위젯 공통 텍스트 표시 설정 (SRS-019, SRS-020) */
export const textDisplaySchema = z.object({
  /** 글자 크기 */
  fontScale: z.enum(['small', 'medium', 'large']).default('medium'),
  /** 줄바꿈 허용 여부. 끄면 한 줄로만 표시 */
  wrap: z.boolean().default(true),
  /** 줄바꿈을 허용할 때 최대 줄 수. 0이면 제한 없음 */
  maxLines: z.number().int().min(0).max(20).default(0),
  /** 넘칠 때 처리 */
  overflow: z.enum(['ellipsis', 'scroll']).default('ellipsis'),
});

export type TextDisplayConfig = z.infer<typeof textDisplaySchema>;

export const DEFAULT_TEXT_DISPLAY: TextDisplayConfig = {
  fontScale: 'medium',
  wrap: true,
  maxLines: 0,
  overflow: 'ellipsis',
};

const FONT_MULTIPLIER: Record<TextDisplayConfig['fontScale'], number> = {
  small: 0.85,
  medium: 1,
  large: 1.3,
};

export const FONT_SCALE_LABELS: Record<TextDisplayConfig['fontScale'], string> = {
  small: '작게',
  medium: '보통',
  large: '크게',
};

/** 설정이 없거나 일부만 있어도 기본값으로 채운다(기존 위젯 호환). */
export function resolveTextDisplay(config: unknown): TextDisplayConfig {
  const parsed = textDisplaySchema.safeParse(config ?? {});
  return parsed.success ? parsed.data : DEFAULT_TEXT_DISPLAY;
}

/** 기준 글자 크기에 배율을 적용한다. 소수점은 반올림. */
export function scaledFontSize(baseSize: number, scale: TextDisplayConfig['fontScale']): number {
  return Math.round(baseSize * FONT_MULTIPLIER[scale]);
}

export type TextRenderProps = {
  numberOfLines?: number;
  ellipsizeMode?: 'tail';
  /** true면 가로 스크롤 컨테이너로 감싼다 */
  horizontalScroll: boolean;
};

/**
 * 표시 설정을 Text 컴포넌트 props로 바꾼다.
 * - 줄바꿈 끔: 한 줄 고정
 * - 줄 수 제한: 그 줄 수까지만
 * - 넘침 처리가 scroll이면 말줄임을 쓰지 않고 가로 스크롤로 보여준다
 */
export function toTextRenderProps(display: TextDisplayConfig): TextRenderProps {
  // 줄바꿈을 끄면 한 줄, 켜면 최대 줄 수(0은 제한 없음)
  const lines = display.wrap ? (display.maxLines > 0 ? display.maxLines : undefined) : 1;

  // 가로 스크롤은 한 줄로 볼 때만 의미가 있다.
  if (!display.wrap && display.overflow === 'scroll') {
    return { numberOfLines: 1, horizontalScroll: true };
  }

  return {
    numberOfLines: lines,
    ellipsizeMode: lines === undefined ? undefined : 'tail',
    horizontalScroll: false,
  };
}
