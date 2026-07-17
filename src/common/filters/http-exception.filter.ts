import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        error = (res as any).error || exception.name;
      } else {
        message = exception.message;
      }
    } else if (exception && exception.name === 'ValidationError') {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      error = 'Bad Request';
    } else if (exception && exception.code === 11000) {
      statusCode = HttpStatus.CONFLICT;
      message = 'Duplicate key error: a resource with these properties already exists.';
      error = 'Conflict';
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(statusCode).json({
      statusCode,
      message: Array.isArray(message) ? message[0] : message,
      error,
    });
  }
}
