import {
  ClassSerializerInterceptor,
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
// import compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { middleware as expressCtx } from 'express-ctx';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import * as morgan from 'morgan';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { QueryFailedFilter } from './filters/query-failed.filter';
import { setupSwagger } from './setup-swagger';
// import { ApiConfigService } from './shared/services/api-config.service';
// import { SharedModule } from './shared/shared.module';

export async function bootstrap(): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enable('trust proxy');
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500, // limit each IP to 100 requests per windowMs
    }),
  );

  // const configService = app.select(SharedModule).get(ApiConfigService);

  // app.use(compression());
  // app.use(morgan('combined')); // You can delete this one
  // app.enableVersioning(); //  You can delete this one
  app.use(cookieParser());

  app.enableCors({
    credentials: true,
    origin: true,
  });

  // const reflector = app.get(Reflector); //  You can delete this one

  // app.useGlobalFilters(new HttpExceptionFilter(reflector), new QueryFailedFilter(reflector)); //  You can delete this one

  // app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector)); //  You can delete this one

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  // if (configService.documentationEnabled) {
  setupSwagger(app);
  // }

  // app.use(expressCtx); // You can delete this one

  // Starts listening for shutdown hooks
  // if (!configService.isDevelopment) {
  //   app.enableShutdownHooks();
  // }

  const port = 3001;
  await app.listen(port);

  console.info(`server running on ${await app.getUrl()}`);

  return app;
}

void bootstrap();
