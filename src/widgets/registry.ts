import type { WidgetDefinition } from './types';

const definitions = new Map<string, WidgetDefinition<any>>();

export function registerWidget<TConfig>(definition: WidgetDefinition<TConfig>) {
  definitions.set(definition.type, definition);
}

export function getWidgetDefinition(type: string): WidgetDefinition<any> | undefined {
  return definitions.get(type);
}

export function listWidgetDefinitions(): WidgetDefinition<any>[] {
  return [...definitions.values()];
}

/** 테스트용: 등록 상태를 비운다. */
export function clearWidgetRegistry() {
  definitions.clear();
}
