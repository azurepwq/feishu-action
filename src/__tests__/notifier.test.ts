import { Notifier } from '../notifier/notifier';
import { FeishuConfig, LocaleDict } from '../types';
import axios from 'axios';

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
}); 