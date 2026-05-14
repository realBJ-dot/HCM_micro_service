import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MockHcmModule } from './mock-hcm/mock-hcm.module';
import { TimeOffModule } from './time-off/time-off.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'hcm_micro.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    HttpModule,
    MockHcmModule,
    TimeOffModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
