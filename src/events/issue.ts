import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleIssue(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const issue = context.payload.issue;
  const action = context.payload.action;
  const templateKey = config.issues?.[action]?.template || 'issue_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ issue.title }}: {{ issue.body }}';
  const text = notifier.renderTemplate(template, { issue, context });
  const title = locale[`issue.${action}.title`] || `Issue ${action}`;
  const at = config.issues?.[action]?.at || config.default.at;
  const style = config.issues?.[action]?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 