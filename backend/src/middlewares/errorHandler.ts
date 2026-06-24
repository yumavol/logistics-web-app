import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '@/lib/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ValidationError) {
    const error = err.data ? { error: err.data } : undefined;
    res.status(err.code).json({ message: err.message, ...error });
    return;
  }
  console.error(err.stack);
  res.status(500).json({ message: err.message });
}
