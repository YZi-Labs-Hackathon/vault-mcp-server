import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      errorCode: 0,
      message: 'OK',
    };
  }
}
