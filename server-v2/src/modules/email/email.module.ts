import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { CoreModule } from '@/core/core.module';

@Module({
    imports: [CoreModule],
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
