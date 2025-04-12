import * as crypto from 'crypto';

export const hashSHA256 = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const generatePassword = (plainPassword: string, salt: string) => {
  const str = plainPassword + '|' + salt;
  return crypto.createHash('sha256').update(str).digest('hex');
};
