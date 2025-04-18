export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export class NotifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotifyError';
  }
}

export class TemplateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateError';
  }
} 