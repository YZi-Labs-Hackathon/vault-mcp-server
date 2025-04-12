import { registerAs } from '@nestjs/config';

export const app = registerAs('app', () => ({
  appName: 'MCP Client API',
}));
