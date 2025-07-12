import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorWithResponse {
  response: {
    message?: string;
    status?: number;
    data?: {
      detail?: string;
    };
  };
}

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const maybeResponse = (error as Record<string, unknown>).response;

    return typeof maybeResponse === 'object' && maybeResponse !== null;
  }

  return false;
}

@Catch()
export class AxiosExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (isErrorWithResponse(exception)) {
      const message =
        exception.response.data?.detail ??
        exception.response.message ??
        'Internal Server Error';
      const status =
        exception.response.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        message,
      });

      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
