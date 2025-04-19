import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigError } from './errors';
import { LocaleDict } from '../types';

// 在 CommonJS 模式下正确获取 __dirname
const getDirName = () => {
  // 尝试使用 Node.js 新版本的路径解析
  try {
    return process.cwd();
  } catch (err) {
    // 回退到传统方式
    return path.resolve();
  }
};

export async function getLocale(language: string, customLocales?: Record<string, Record<string, string>>): Promise<LocaleDict> {
  let locale: LocaleDict = {};
  // 1. 加载默认 locales 文件
  const localePath = path.resolve(getDirName(), 'locales', `${language}.json`);
  try {
    if (fs.existsSync(localePath)) {
      const content = fs.readFileSync(localePath, 'utf8');
      locale = JSON.parse(content);
    }
  } catch (err) {
    throw new ConfigError(`Failed to load locale file: ${(err as Error).message}`);
  }
  // 2. 合并自定义 locales
  if (customLocales && customLocales[language]) {
    locale = { ...locale, ...customLocales[language] };
  }
  if (Object.keys(locale).length === 0) {
    throw new ConfigError(`Locale not found for language: ${language}`);
  }
  return locale;
} 