import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleFork(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const forkee = context.payload.forkee;
  const templateKey = config.fork?.template || 'fork_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || 'Repo forked: {{ forkee.full_name }}';
  const text = notifier.renderTemplate(template, { forkee, context });
  const title = locale['fork.title'] || 'Fork Event';
  const at = config.fork?.at || config.default.at;
  const style = config.fork?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 