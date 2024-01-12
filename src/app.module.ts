import type { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { RecordsModule } from './modules/records/records.module';
import { ServicesModule } from './common/services/services.module';

@Module({
  imports: [
    ServicesModule,
    RecordsModule,
    ConfigModule.forRoot({
      isGlobal: true,

      // if one is going to have dev/prod environment, there has to be .env.development / .env.production
      envFilePath: '.env',
    }),
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}
