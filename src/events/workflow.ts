import { GithubContext, FeishuConfig, LocaleDict } from '../types';
import { Notifier } from '../notifier/notifier';

export async function handleWorkflow(context: GithubContext, config: FeishuConfig, notifier: Notifier, locale: LocaleDict) {
  const workflow = context.payload.workflow_run;
  const templateKey = config.workflow_run?.template || 'workflow_default';
  const template = config.templates?.[templateKey] || locale[`template.${templateKey}`] || '{{ workflow.name }}: {{ workflow.conclusion }}';
  const text = notifier.renderTemplate(template, { workflow, context });
  const title = locale['workflow.title'] || 'Workflow Run';
  const at = config.workflow_run?.at || config.default.at;
  const style = config.workflow_run?.style || config.default.style;
  await notifier.notify({
    title,
    text,
    at,
    style
  });
} 