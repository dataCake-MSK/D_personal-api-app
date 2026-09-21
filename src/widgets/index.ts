import { httpActionWidget } from './http-action/http-action-widget';
import { httpJsonWidget } from './http-json/http-json-widget';
import { registerWidget } from './registry';
import { textWidget } from './text/text-widget';

/** 앱에서 쓸 위젯을 등록한다. 새 위젯은 여기에 한 줄 추가한다. */
export function registerBuiltInWidgets() {
  registerWidget(textWidget);
  registerWidget(httpJsonWidget);
  registerWidget(httpActionWidget);
}

export { getWidgetDefinition, listWidgetDefinitions, registerWidget } from './registry';
export { WidgetCard } from './widget-card';
export type { WidgetDefinition, WidgetInstanceLike, WidgetRendererProps } from './types';
