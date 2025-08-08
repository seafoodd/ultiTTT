import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.config';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [EnvConfig],
    exports: [EnvConfig],
})
export class CoreModule {}
