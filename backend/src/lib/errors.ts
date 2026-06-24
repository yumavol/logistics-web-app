export class ValidationError extends Error {
  code: number;
  data?: Record<string, unknown>;

  constructor(message: string, data?: Record<string, unknown>, code = 400) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.data = data;
  }
}
