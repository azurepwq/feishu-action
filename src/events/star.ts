import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleStar(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const sender = context.payload.sender as Record<string, unknown>;
  const templateKey = config.star?.template || 'star_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ sender.login }} starred the repo';
  const text = notifier.renderTemplate(template, { ...(sender as object), sender, context });
  const title = locale['star.title'] || 'Star Event';
  const at = config.star?.at || config.default.at;
  const style = config.star?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 