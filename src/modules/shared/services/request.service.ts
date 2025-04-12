import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';

export interface RequestInterface extends AxiosRequestConfig {
  query?: any;
}

@Injectable()
export class RequestService {
  constructor(private readonly httpService: HttpService) {}

  async request(request) {
    let configOption: any;
    const injectHeaders = {};
    const headers = request.headers || {};

    // eslint-disable-next-line prefer-const
    configOption = {
      url: request.url,
      method: request.method,
      validateStatus: () => true,
      headers: {
        ...injectHeaders,
        ...headers,
      },
      params: request.params,
      data: request.data,
      auth: request.auth,
    };

    if (request.timeout) {
      configOption.timeout = request.timeout;
    }

    if (request.proxy) {
      configOption.proxy = request.proxy;
    }

    if (request.query) {
      configOption.params = request.query;
    }
    const response = await this.httpService.axiosRef.request(configOption);
    if (!(response.status >= 200 && response.status < 300)) {
      console.error(response);
      throw new BadRequestException(response.statusText);
    }
    return response.data;
  }
}
