import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CipherService {
  private readonly algorithm = 'aes-256-cbc';

  encrypt(text: string, secret: string, iv: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, secret, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string, secret: string, iv: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, secret, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
