import axios from 'axios';
import * as Mustache from 'mustache';
import { FeishuConfig, LocaleDict } from '../types';
import { NotifyError, TemplateError } from '../utils/errors';

interface NotifyOptions {
  title: string;
  text: string;
  at?: string[] | undefined;
  style?: string;
  emoji?: string;
}

export class Notifier {
  private webhook: string;
  private config: FeishuConfig;
  private locale: LocaleDict;

  constructor(webhook: string, config: FeishuConfig, locale: LocaleDict) {
    this.webhook = webhook;
    this.config = config;
    this.locale = locale;
  }

  async notify(options: NotifyOptions): Promise<void> {
    const style = options.style || this.config.default.style || 'engineer';
    const emoji = options.emoji || this.getEmoji(style);
    const atList = options.at || this.config.default.at || [];
    const content = `${emoji} ${options.title}\n${options.text}`;
    const atText = atList.length > 0 ? atList.map(id => `<at user_id="${id}"></at>`).join(' ') : '';
    const msg = {
      msg_type: 'text',
      content: {
        text: `${content}\n${atText}`
      }
    };
    try {
      const res = await axios.post(this.webhook, msg, { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (res.data.StatusCode && res.data.StatusCode !== 0) {
        throw new NotifyError(`Feishu API error: ${res.data.StatusMessage || JSON.stringify(res.data)}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new NotifyError(`Failed to send Feishu notification: ${err.message} (${err.code})`);
      }
      throw new NotifyError(`Failed to send Feishu notification: ${(err as Error).message}`);
    }
  }

  renderTemplate(template: string, context: Record<string, unknown>): string {
    try {
      return Mustache.render(template, context);
    } catch (err) {
      throw new TemplateError(`Template render error: ${(err as Error).message}`);
    }
  }

  getEmoji(style: string): string {
    switch (style) {
      case 'engineer': return '🛠️';
      case 'cute': return '🌸';
      case 'hacker_girl': return '👩‍💻';
      case 'japan': return '🎌';
      default: return '🔔';
    }
  }
} 