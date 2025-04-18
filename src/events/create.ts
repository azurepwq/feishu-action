import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleCreate(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const ref = context.payload.ref;
  const refType = context.payload.ref_type;
  const templateKey = config.create?.template || 'create_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ ref_type }}: {{ ref }}';
  const text = notifier.renderTemplate(template, { ref, refType, context });
  const title = locale['create.title'] || 'Create Event';
  const at = config.create?.at || config.default.at;
  const style = config.create?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 