import * as fs from 'node:fs';
import * as yaml from 'js-yaml';
import { ConfigError } from './errors';
import { FeishuConfig } from '../types';

export async function loadConfig(path: string): Promise<FeishuConfig> {
  try {
    const content = fs.readFileSync(path, 'utf8');
    const config = yaml.load(content) as FeishuConfig;
    if (!config || typeof config !== 'object' || !config.default) {
      throw new ConfigError('Invalid config: missing default section');
    }
    return config;
  } catch (err) {
    throw new ConfigError(`Failed to load config: ${(err as Error).message}`);
  }
} 