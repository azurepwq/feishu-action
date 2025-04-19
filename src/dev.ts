import { run } from './core/main';
import * as fs from 'node:fs';
import * as path from 'node:path';
import axios from 'axios';
import * as github from '@actions/github';

// 定义运行模式类型
type RunMode = 'mock' | 'dev' | 'prod';

// 从环境变量获取运行模式，默认为 mock
const runMode = (process.env.FEISHU_RUN_MODE || 'mock') as RunMode;

// 从环境变量获取 webhook URLs
const devWebhook = process.env.FEISHU_DEV_WEBHOOK;
const prodWebhook = process.env.FEISHU_PROD_WEBHOOK;

// 保存原始 axios.post 方法
const _originalAxiosPost = axios.post;

// 根据运行模式配置
switch (runMode) {
  case 'mock':
    console.log('🔄 使用模拟模式 (mock) - 请求将被拦截，模拟成功响应');
    // 直接替换 axios.post 方法
    axios.post = ((url: string, data: Record<string, unknown>) => {
      console.log(`📤 模拟发送到 ${url}:\n`, JSON.stringify(data, null, 2));
      return Promise.resolve({
        data: { StatusCode: 0, StatusMessage: 'Success (mocked)' }
      });
    }) as typeof axios.post;
    
    // 设置模拟的 webhook URL
    process.env.INPUT_FEISHU_WEBHOOK = 'https://mock-webhook-not-real.feishu.cn/mock';
    break;
    
  case 'dev':
    console.log('🧪 使用开发模式 (dev) - 使用开发环境飞书 webhook');
    // 使用开发环境 webhook，优先从环境变量加载
    if (!devWebhook) {
      console.warn('⚠️ 未设置 FEISHU_DEV_WEBHOOK 环境变量，请设置或切换到 mock 模式');
    }
    process.env.INPUT_FEISHU_WEBHOOK = devWebhook || 'https://open.feishu.cn/webhook-not-set';
    break;
    
  case 'prod':
    console.log('🚀 使用生产模式 (prod) - 将使用生产环境飞书 webhook');
    // 生产环境应该从 GitHub Action 参数传入
    if (!prodWebhook) {
      console.warn('⚠️ 未设置 FEISHU_PROD_WEBHOOK 环境变量');
    }
    process.env.INPUT_FEISHU_WEBHOOK = prodWebhook || 'https://open.feishu.cn/webhook-not-set';
    break;
    
  default:
    console.error(`❌ 未知模式: ${runMode}，将使用 mock 模式`);
    process.env.INPUT_FEISHU_WEBHOOK = 'https://mock-webhook-default.feishu.cn/mock';
}

// 设置配置文件路径
process.env.INPUT_CONFIG_PATH = '.github/feishu/config.yml';

// 创建模拟配置文件
const configDir = path.resolve('.github/feishu');
const configPath = path.resolve(configDir, 'config.yml');

// 确保配置目录存在
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// 如果配置文件不存在，创建一个示例配置
if (!fs.existsSync(configPath)) {
  const exampleConfig = `
default:
  language: zh-CN
  style: engineer
  at:
    - user_id_1
templates:
  pr_opened: "🚀 PR已开启：{{ title }}\\n作者：{{ user.login }}"
  pr_closed: "🎉 PR已合并：{{ title }}"
  push_default: "📦 代码已推送到 {{ push.ref }}\\n提交信息：{{ push.head_commit.message }}"
pr:
  opened:
    template: pr_opened
  closed:
    template: pr_closed
push:
  template: push_default
`;
  fs.writeFileSync(configPath, exampleConfig, 'utf8');
  console.log(`📝 创建示例配置: ${configPath}`);
}

// 模拟一个 GitHub 事件
const mockPrEvent = {
  eventName: 'pull_request',
  payload: {
    action: 'opened',
    pull_request: {
      title: '这是一个测试PR标题',
      user: {
        login: 'azurepwq'
      },
      html_url: 'https://github.com/user/repo/pull/1'
    },
    repository: {
      full_name: 'user/repo'
    }
  }
};

// 设置开发环境标志
process.env.NODE_ENV = 'development';

// 创建临时事件文件
fs.writeFileSync('/tmp/mock-event.json', JSON.stringify(mockPrEvent.payload), 'utf8');

// 强行覆盖 github.context，确保 payload 正确
Object.defineProperty(github, 'context', {
  value: {
    ...github.context,
    eventName: mockPrEvent.eventName,
    payload: mockPrEvent.payload
  },
  writable: true
});

// 打印更明确的调试信息
console.log(`✅ 开发环境准备完成，开始执行...`);
console.log(`🔧 模拟事件: ${mockPrEvent.eventName}, 动作: ${mockPrEvent.payload.action}`);
run().catch(err => {
  console.error('❌ 开发运行出错:', err);
});
