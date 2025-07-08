import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvConfig {
  constructor(private readonly config: ConfigService) {}

  get env(): string {
    return this.config.get<string>('ENV') ?? 'production';
  }

  get isDevelopment(): boolean {
    return this.env === 'development';
  }

  get isProduction(): boolean {
    return this.env === 'production';
  }

  getEnvVarOrThrow(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) throw new Error(`Environment variable "${key}" is not set`);
    return value;
  }
}
