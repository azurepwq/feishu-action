import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleComment(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const comment = context.payload.comment as Record<string, unknown>;
  const action = context.payload.action as string;
  const templateKey = config.issue_comment?.[action]?.template || 'comment_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ comment.body }}';
  const text = notifier.renderTemplate(template, { ...(comment as object), comment, context });
  const title = locale[`comment.${action}.title`] || locale['comment.title'] || 'New Comment';
  const at = config.issue_comment?.[action]?.at || config.default.at;
  const style = config.issue_comment?.[action]?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 