export type WidgetConfig = Record<string, unknown>;

export type WidgetInstance = {
  id: string;
  type: string;
  config: WidgetConfig;
};

export type Dashboard = {
  /** 화면에 보이는 순서 = 배열 순서 */
  widgets: WidgetInstance[];
};
