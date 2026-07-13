// src/core/exceptions/base.exception.ts
export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly metadata?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    code?: string,
    metadata?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.metadata = metadata;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific exceptions
export class BadRequestException extends BaseException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 400, true, 'BAD_REQUEST', metadata);
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN');
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super(message, 404, true, 'NOT_FOUND');
  }
}

export class ConflictException extends BaseException {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, 409, true, 'CONFLICT', metadata);
  }
}

export class InternalServerException extends BaseException {
  constructor(message: string = 'Internal server error') {
    super(message, 500, false, 'INTERNAL_SERVER_ERROR');
  }
}