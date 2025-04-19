import { Notifier } from '../notifier/notifier';
import { GithubContext, FeishuConfig, LocaleDict } from '../types';

// 直接导入所有处理模块，避免动态导入问题
import * as prHandler from '../events/pr';
import * as pushHandler from '../events/push';
import * as releaseHandler from '../events/release';
import * as issueHandler from '../events/issue';
import * as workflowHandler from '../events/workflow';
import * as createHandler from '../events/create';
import * as commentHandler from '../events/comment';
import * as deleteHandler from '../events/delete';
import * as forkHandler from '../events/fork';
import * as starHandler from '../events/star';

interface HandleEventOptions {
  github: typeof import('@actions/github');
  context: GithubContext;
  config: FeishuConfig;
  notifier: Notifier;
  locale: LocaleDict;
}

export async function handleEvent({ github: _github, context, config, notifier, locale }: HandleEventOptions) {
  const eventName = context.eventName;
  console.log(`处理事件: ${eventName}`);
  
  try {
    switch (eventName) {
      case 'pull_request':
        return prHandler.handlePullRequest(context, config, notifier, locale);
      case 'push':
        return pushHandler.handlePush(context, config, notifier, locale);
      case 'release':
        return releaseHandler.handleRelease(context, config, notifier, locale);
      case 'issues':
        return issueHandler.handleIssue(context, config, notifier, locale);
      case 'workflow_run':
        return workflowHandler.handleWorkflow(context, config, notifier, locale);
      case 'create':
        return createHandler.handleCreate(context, config, notifier, locale);
      case 'issue_comment':
        return commentHandler.handleComment(context, config, notifier, locale);
      case 'delete':
        return deleteHandler.handleDelete(context, config, notifier, locale);
      case 'fork':
        return forkHandler.handleFork(context, config, notifier, locale);
      case 'star':
        return starHandler.handleStar(context, config, notifier, locale);
      default:
        return notifier.notify({
          title: locale['event.unsupported.title'] || 'Unsupported Event',
          text: `${eventName} is not supported yet.`
        });
    }
  } catch (err) {
    console.error('路由处理错误:', err);
    return notifier.notify({
      title: '事件处理异常',
      text: `处理 ${eventName} 事件时发生错误：${(err as Error).message || err}`
    });
  }
} 