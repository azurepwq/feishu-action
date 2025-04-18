export interface GithubContext {
  eventName: string;
  payload: any;
  [key: string]: any;
}

export interface FeishuConfig {
  default: {
    language: string;
    style: string;
    at?: string[];
  };
  [event: string]: any;
  locales?: Record<string, any>;
}

export type LocaleDict = Record<string, string>; 