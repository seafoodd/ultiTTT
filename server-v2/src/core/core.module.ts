import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';
import { DisposableEmailService } from '@/core/disposable-email/disposable-email.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EnvConfig, DisposableEmailService],
  exports: [EnvConfig, DisposableEmailService],
})
export class CoreModule {}
