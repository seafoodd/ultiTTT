import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { AxiosExceptionFilter } from '@/core/filters/axios-exception.filter';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EnvConfig, AxiosExceptionFilter],
  exports: [EnvConfig, AxiosExceptionFilter],
})
export class CoreModule {}
