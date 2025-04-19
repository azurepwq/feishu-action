import { Notifier } from '../notifier/notifier';
import { FeishuConfig, LocaleDict } from '../types';
import axios from 'axios';
import Mustache from 'mustache';
import { getLocale, translate } from '../utils/i18n';
import fs from 'fs';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Notifier', () => {
  const config: FeishuConfig = {
    default: { language: 'en-US', style: 'engineer', at: ['id1'] },
  };
  const locale: LocaleDict = { 'template.pr_default': 'Hello {{ pr.title }}' };
  const notifier = new Notifier('https://fake-webhook', config, locale);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should render template', () => {
    const result = notifier.renderTemplate('Hi {{ name }}', { name: 'World' });
    expect(result).toBe('Hi World');
  });

  it('should get emoji by style', () => {
    expect(notifier.getEmoji('engineer')).toBe('🛠️');
    expect(notifier.getEmoji('cute')).toBe('🌸');
    expect(notifier.getEmoji('hacker_girl')).toBe('👩‍💻');
    expect(notifier.getEmoji('japan')).toBe('🎌');
    expect(notifier.getEmoji('unknown')).toBe('🔔');
  });

  it('should send notification successfully', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { StatusCode: 0 } });
    await expect(
      notifier.notify({ title: 'T', text: 'C', at: ['id1'], style: 'engineer' })
    ).resolves.toBeUndefined();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://fake-webhook',
      expect.objectContaining({
        msg_type: 'text',
        content: expect.objectContaining({
          text: expect.stringContaining('T')
        })
      }),
      expect.objectContaining({
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should throw on Feishu API error', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { StatusCode: 1, StatusMessage: 'fail' } });
    await expect(
      notifier.notify({ title: 'T', text: 'C' })
    ).rejects.toThrow('Feishu API error: fail');
  });

  it('should throw on axios error', async () => {
    const axiosError = Object.assign(new Error('network error'), {
      isAxiosError: true,
      code: 'ECONNREFUSED'
    });
    mockedAxios.post.mockRejectedValueOnce(axiosError);
    mockedAxios.isAxiosError.mockReturnValueOnce(true);

    await expect(
      notifier.notify({ title: 'T', text: 'C' })
    ).rejects.toThrow('Failed to send Feishu notification: network error (ECONNREFUSED)');
  });

  it('should use default style and at when not provided', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { StatusCode: 0 } });
    await expect(
      notifier.notify({ title: 'T', text: 'C' })
    ).resolves.toBeUndefined();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://fake-webhook',
      expect.objectContaining({
        msg_type: 'text',
        content: expect.objectContaining({
          text: expect.stringContaining('T')
        })
      }),
      expect.objectContaining({
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  });

  it('should throw TemplateError on render error', () => {
    jest.spyOn(Mustache, 'render').mockImplementation(() => {
      throw new Error('render error');
    });

    expect(() => {
      notifier.renderTemplate('Hi {{ name }}', { name: 'World' });
    }).toThrow('Template render error: render error');
  });

  it('should construct Notifier with different configs', () => {
    const config1: FeishuConfig = { default: { language: 'zh', style: 'cute' } };
    const locale1: LocaleDict = {};
    const notifier1 = new Notifier('webhook1', config1, locale1);
    expect((notifier1 as any).webhook).toBe('webhook1');
    expect((notifier1 as any).config).toBe(config1);
    expect((notifier1 as any).locale).toBe(locale1);

    const config2: FeishuConfig = { default: { language: 'en', style: 'engineer', at: [] } };
    const locale2: LocaleDict = { hello: 'world' };
    const notifier2 = new Notifier('webhook2', config2, locale2);
    expect((notifier2 as any).webhook).toBe('webhook2');
    expect((notifier2 as any).config).toBe(config2);
    expect((notifier2 as any).locale).toBe(locale2);
  });

  it('should handle empty config gracefully', () => {
    const emptyConfig: FeishuConfig = { default: { language: '', style: '' } };
    const emptyLocale: LocaleDict = {};
    const notifier = new Notifier('webhook', emptyConfig, emptyLocale);
    expect((notifier as any).webhook).toBe('webhook');
    expect((notifier as any).config).toBe(emptyConfig);
    expect((notifier as any).locale).toBe(emptyLocale);
  });
});

describe('getLocale', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return locale if exists', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"hello":"world"}');
    const result = await getLocale('en');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should merge customLocales', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"hello":"world"}');
    const result = await getLocale('en', { en: { hi: 'there' } });
    expect(result).toEqual({ hello: 'world', hi: 'there' });
  });

  it('should throw if locale file and customLocales are missing', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);
    await expect(getLocale('zh')).rejects.toThrow('Locale not found for language: zh');
  });

  it('should throw ConfigError if file read fails', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockImplementation(() => { throw new Error('fail'); });
    await expect(getLocale('en')).rejects.toThrow('Failed to load locale file: fail');
  });

  it('should correctly merge custom locales', async () => {
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'readFileSync').mockReturnValue('{"hello":"world"}');
    const result = await getLocale('en', { en: { hello: 'everyone', hi: 'there' } });
    expect(result).toEqual({ hello: 'everyone', hi: 'there' });
  });
});

describe('translate', () => {
  it('should return translation if key exists', () => {
    const dict = { hello: 'world' };
    expect(translate('hello', dict)).toBe('world');
  });

  it('should throw if key does not exist', () => {
    const dict = { hello: 'world' };
    expect(() => translate('bye', dict)).toThrow('Key not found');
  });
}); 