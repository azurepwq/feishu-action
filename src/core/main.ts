import * as core from '@actions/core';
import * as github from '@actions/github';
import { Notifier } from '../notifier/notifier';
import { loadConfig } from '../utils/config';
import { getLocale } from '../utils/i18n';
import { handleEvent } from './router';
import { ConfigError, NotifyError } from '../utils/errors';

export async function run() {
  try {
    // 调试输出 GitHub Context 信息
    const eventName = process.env.GITHUB_EVENT_NAME || github.context.eventName;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 GitHub 事件: ${eventName}`);
      console.log(`📂 事件数据路径: ${process.env.GITHUB_EVENT_PATH || github.context.payload}`);
    }

    const feishuWebhook = core.getInput('feishu_webhook', { required: true });
    const configPath = core.getInput('config_path') || '.github/feishu/config.yml';
    const config = await loadConfig(configPath);
    const language = config.default?.language || 'zh-CN';
    const locale = await getLocale(language, config.locales);
    const notifier = new Notifier(feishuWebhook, config, locale);
    
    // 确保在运行时提供正确的 eventName
    const githubContext = {
      ...github.context,
      eventName: eventName
    };
    
    await handleEvent({
      github,
      context: githubContext,
      config,
      notifier,
      locale
    });
  } catch (err) {
    if (err instanceof ConfigError || err instanceof NotifyError) {
      core.setFailed(`[feishu-action] ${err.message}`);
    } else {
      core.setFailed(`[feishu-action] Unexpected error: ${(err as Error).message}`);
    }
  }
} 