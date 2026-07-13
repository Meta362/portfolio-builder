// src/core/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate as classValidate, ValidationError } from 'class-validator';
import { BadRequestException } from '../exceptions/base.exception';

export function validate<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = plainToInstance(dtoClass, req.body);
      const errors = await classValidate(dto, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false
      });

      if (errors.length > 0) {
        const errorMessages = formatValidationErrors(errors);
        throw new BadRequestException('Validation failed', { errors: errorMessages });
      }

      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
}

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const formattedErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    if (error.constraints) {
      formattedErrors[error.property] = Object.values(error.constraints);
    }

    if (error.children && error.children.length > 0) {
      const childErrors = formatValidationErrors(error.children);
      formattedErrors[error.property] = Object.values(childErrors).flat();
    }
  });

  return formattedErrors;
}