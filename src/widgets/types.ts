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

export type WidgetDefinition<TConfig = unknown> = {
  type: string;
  label: string;
  configSchema: ZodType<TConfig>;
  Renderer: ComponentType<WidgetRendererProps<TConfig>>;
};
