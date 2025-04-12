import { Global, Module } from '@nestjs/common';
import { CipherService } from '@modules/shared/services/cipher.service';
import { RequestService } from '@modules/shared/services/request.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [CipherService, RequestService],
  exports: [CipherService, RequestService],
})
export class SharedModule {}
