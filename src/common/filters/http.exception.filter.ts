import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpResponseError } from './http.response.error';
import { CustomException } from '../errors';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let message = (exception as any).message?.message;

    // console.log('exception', exception.constructor);

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let code = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.constructor) {
      case CustomException:
        status = (exception as CustomException).getStatus();
        message = (exception as CustomException).payload.error;
        code = (exception as CustomException).payload.code;
        break;
      case BadRequestException:
        status = HttpStatus.BAD_REQUEST;
        message = (exception as BadRequestException).message;
        break;
      default: {
        message = (exception as any)?.message;
      }
    }
    Logger.error(message, `${request?.method} ${request?.url}`);

    response
      .status(status)
      .json(HttpResponseError(status, message, request, code));
  }
}
