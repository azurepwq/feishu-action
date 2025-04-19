export interface GithubContext {
  eventName: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
}

// 定义每个事件配置的通用结构
interface EventConfig {
  template?: string;
  style?: string;
  at?: string[];
}

export interface FeishuConfig {
  default: {
    language: string;
    style: string;
    at?: string[];
  };
  pr?: Record<string, EventConfig>;
  push?: EventConfig;
  issues?: Record<string, EventConfig>;
  release?: Record<string, EventConfig>;
  workflow_run?: EventConfig;
  create?: EventConfig;
  delete?: EventConfig;
  issue_comment?: Record<string, EventConfig>;
  fork?: EventConfig;
  star?: EventConfig;
  templates?: Record<string, string>;
  [event: string]: unknown;
  locales?: Record<string, Record<string, string>>;
}

export type LocaleDict = Record<string, string>; 