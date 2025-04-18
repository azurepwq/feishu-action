import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handlePush(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const push = context.payload;
  const templateKey = config.push?.template || 'push_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ ref }}: {{ head_commit.message }}';
  const text = notifier.renderTemplate(template, { push, context });
  const title = locale['push.title'] || 'Push Event';
  const at = config.push?.at || config.default.at;
  const style = config.push?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 