export interface GithubContext {
  eventName: string;
  payload: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FeishuConfig {
  default: {
    language: string;
    style: string;
    at?: string[];
  };
  pr?: Record<string, Record<string, unknown>>;
  push?: Record<string, unknown>;
  templates?: Record<string, string>;
  [event: string]: unknown;
  locales?: Record<string, Record<string, string>>;
}

export type LocaleDict = Record<string, string>; 