import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { validationPipes } from './common/pipes';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './common/swagger';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'debug', 'warn', 'verbose', 'log'],
    bodyParser: true,
    cors: true,
  });

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(), new TypeOrmExceptionFilter());
  app.useGlobalPipes(validationPipes);
  app.enableCors();
  app.enableShutdownHooks();
  app.setGlobalPrefix('v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: '/health', method: RequestMethod.GET },
    ],
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
  //console.log(fs);
  //fs.writeFileSync(path.join(process.cwd(), 'swagger.json'), JSON.stringify(document));

  const PORT = process.env.APP_PORT;
  await app.listen(PORT, () => {
    console.log(`Service running on ${PORT}`);
  });
}

bootstrap();
