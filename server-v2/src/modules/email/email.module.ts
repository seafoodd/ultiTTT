import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EnvConfig } from '@/common/config/env.config';

@Module({
  providers: [EmailService, EnvConfig],
  exports: [EmailService],
})
export class EmailModule {}
