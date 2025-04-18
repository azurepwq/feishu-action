import * as fs from 'node:fs';
import * as path from 'node:path';
import { getLocale } from '../utils/i18n';
import { ConfigError } from '../utils/errors';

// 使用 jest mock
jest.mock('node:fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('getLocale', () => {
  // 不再需要 __dirname polyfill，使用 process.cwd() 代替
  const basePath = path.resolve(process.cwd(), 'locales/en-US.json');
  
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should load default locale', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{"hello":"world"}' as any);
    const locale = await getLocale('en-US');
    expect(locale.hello).toBe('world');
  });

  it('should merge custom locale', async () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{"hello":"world"}' as any);
    const locale = await getLocale('en-US', { 'en-US': { hi: 'there' } });
    expect(locale.hello).toBe('world');
    expect(locale.hi).toBe('there');
  });

  it('should throw if locale not found', async () => {
    mockedFs.existsSync.mockReturnValue(false);
    await expect(getLocale('not-exist')).rejects.toThrow(ConfigError);
  });
}); 