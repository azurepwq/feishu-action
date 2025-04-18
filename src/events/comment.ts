import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleComment(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const comment = context.payload.comment;
  const templateKey = config.issue_comment?.template || 'comment_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ comment.body }}';
  const text = notifier.renderTemplate(template, { comment, context });
  const title = locale['comment.title'] || 'New Comment';
  const at = config.issue_comment?.at || config.default.at;
  const style = config.issue_comment?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 