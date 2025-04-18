import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handlePullRequest(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const action = context.payload.action;
  const pr = context.payload.pull_request;
  const templateKey = config.pr?.[action]?.template || 'pr_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ pr.title }}';
  const text = notifier.renderTemplate(template, { ...pr, pr, context });
  const title = locale[`pr.${action}.title`] || `PR ${action}`;
  const at = config.pr?.[action]?.at || config.default.at;
  const style = config.pr?.[action]?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
}

// 添加默认导出以兼容 ESM 动态导入
export default handlePullRequest; 