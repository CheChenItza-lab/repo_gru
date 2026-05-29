import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { AreasModule } from './areas/areas.module';
import { ReadingsModule } from './readings/readings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ReportsModule } from './reports/reports.module';
import { ConteinersModule } from './conteiners/conteiners.module';
import { SensorsModule } from './sensors/sensors.module';

@Module({
  imports: 
  [
    ConfigModule.forRoot({ isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    AuthModule, 
    UsersModule, 
    SchoolsModule, 
    AreasModule, 
    ReadingsModule, 
    AnalyticsModule, 
    ReportsModule, ConteinersModule, SensorsModule],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
