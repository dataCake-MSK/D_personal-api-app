import type { ComponentType } from 'react';
import type { ZodType } from 'zod';

/** 위젯 렌더러가 받는 props. config는 configSchema로 검증된 값이다. */
export type WidgetRendererProps<TConfig> = {
  id: string;
  config: TConfig;
};

/** 대시보드에 배치된 위젯 하나. 저장소 구현과 무관하게 이 형태만 있으면 그릴 수 있다. */
export type WidgetInstanceLike = {
  id: string;
  type: string;
  config: unknown;
};

/** 설정 입력 UI가 받는 props. 값은 아직 검증 전이라 부분 입력 상태일 수 있다. */
export type WidgetConfigEditorProps = {
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
};

export type WidgetDefinition<TConfig = unknown> = {
  type: string;
  label: string;
  configSchema: ZodType<TConfig>;
  Renderer: ComponentType<WidgetRendererProps<TConfig>>;
  ConfigEditor: ComponentType<WidgetConfigEditorProps>;
  /** 설정 입력 화면의 초기값 */
  defaultConfig: Record<string, unknown>;
};
