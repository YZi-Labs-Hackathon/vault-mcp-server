import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API Docs')
  .setDescription('Documents the current exposed endpoints')
  .setVersion('1.0')
  .addTag('Chat', 'Implements all chat related endpoints')
  .build();