import { Request } from 'express';
import { IResponseError } from './response.error.interface';

export const HttpResponseError: (
  statusCode: number,
  message: string,
  request: Request,
  errorCode?: number,
) => IResponseError = (
  statusCode: number,
  message: string,
  request,
  errorCode?: number,
): IResponseError => {
  return {
    statusCode: statusCode,
    message,
    errorCode: errorCode ?? statusCode,
  };
};
