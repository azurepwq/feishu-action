# feishu-action

[![Build Status](https://github.com/your-org/feishu-action/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/feishu-action/actions)
[![Coverage Status](https://img.shields.io/coveralls/github/your-org/feishu-action/main.svg)](https://coveralls.io/github/your-org/feishu-action)
[![Version](https://img.shields.io/npm/v/feishu-action.svg)](https://www.npmjs.com/package/feishu-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 🚀 GitHub Action：多事件、可定制、支持多风格和国际化的飞书群通知

## 功能特性
- 支持 PR、Push、Release、Issue、Branch、Workflow 等多种 GitHub 事件
- 通知模板、emoji、风格可定制，支持多种通知风格
- 支持通过 `config.yml` 集中管理事件与模板
- 支持中英文国际化，用户可自定义语言包
- 支持通过参数动态 @ 指定人员
- 健壮的错误处理与详细日志
- 单元测试覆盖率 >90%，CI 检查
- 自动生成 API 文档

## 快速开始

1. 在你的仓库 `.github/workflows/` 下新建 workflow 文件：

```yaml
name: Feishu Notify
on:
  pull_request:
    types: [opened, synchronize, closed]
  push:
  release:
  issues:
  workflow_run:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azurepwq/feishu-action@v1
        with:
          feishu_webhook: ${{ secrets.FEISHU_WEBHOOK }}
          config_path: .github/feishu/config.yml
```

2. 在 `.github/feishu/config.yml` 配置通知模板、风格、语言等：

```yaml
default:
  language: zh-CN
  style: engineer
  at:
    - feishu_id1
    - feishu_id2
pr:
  opened:
    template: pr_opened
  closed:
    template: pr_closed
push:
  template: push
```

## 通知模板与风格
- 支持多种风格（工程风、可爱风、女黑客风、日系风）
- 模板支持 Mustache 语法，支持所有事件上下文变量
- 可自定义 emoji、@人员

## 国际化（i18n）
- 语言包位于 `locales/`，支持 zh-CN、en-US
- 可通过 config.yml 配置 `language`
- 支持自定义语言包覆盖

## 开发与测试
```bash
npm install

# 1. 模拟模式开发 (Mock 响应)
npm run dev     # 或 npm run dev:mock

# 2. 使用开发环境 webhook
# 先设置 FEISHU_DEV_WEBHOOK 环境变量或在 .env 文件中配置
npm run dev:real

# 3. 使用生产环境 webhook
# 先设置 FEISHU_PROD_WEBHOOK 环境变量或在 .env 文件中配置
npm run dev:prod

# 运行测试
npm run test
npm run coverage

# 构建
npm run build

# 生成文档
npm run docs
```

### 环境变量配置
1. 复制 `.env.example` 到 `.env` 文件
2. 修改 `.env` 中的配置:
   - `FEISHU_RUN_MODE`: 运行模式 (`mock`, `dev`, 或 `prod`)
   - `FEISHU_DEV_WEBHOOK`: 开发环境飞书 webhook URL
   - `FEISHU_PROD_WEBHOOK`: 生产环境飞书 webhook URL

## 贡献指南
- 遵循 Conventional Commits
- 使用 `npm run commit` 交互式提交
- PR 需通过测试与覆盖率检查

## API 文档
- [查看 docs/ 目录](./docs/index.html)

## 常见问题
- [FAQ](./docs/FAQ.md)

## License
MIT 