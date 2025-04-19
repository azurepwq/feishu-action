import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleDelete(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const ref = context.payload.ref as string;
  const refType = context.payload.ref_type as string;
  const templateKey = config.delete?.template || 'delete_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ ref_type }} deleted: {{ ref }}';
  const text = notifier.renderTemplate(template, { ref, ref_type: refType, context });
  const title = locale['delete.title'] || 'Delete Event';
  const at = config.delete?.at || config.default.at;
  const style = config.delete?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 