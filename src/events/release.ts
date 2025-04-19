import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleRelease(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const release = context.payload.release as Record<string, unknown>;
  const action = context.payload.action as string;
  const templateKey = config.release?.[action]?.template || 'release_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ release.name }}: {{ release.body }}';
  const text = notifier.renderTemplate(template, { ...(release as object), release, context });
  const title = locale[`release.${action}.title`] || `Release ${action}`;
  const at = config.release?.[action]?.at || config.default.at;
  const style = config.release?.[action]?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 