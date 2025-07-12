import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AxiosExceptionFilter } from '@/core/filters/axios-exception.filter';
import { EnvConfig } from '@/core/config/env.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const envConfig = app.get(EnvConfig);

  const allowedOrigins = envConfig.isDevelopment
    ? ['http://localhost:5173']
    : [envConfig.getEnvVarOrThrow('DOMAIN_URL')];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalFilters(app.get(AxiosExceptionFilter));

  const config = new DocumentBuilder()
    .setTitle('ultiTTT API')
    .setDescription('ultiTTT API docs.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('', app, document);

  const PORT = envConfig.getEnvVar('PORT') || 5000;
  await app.listen(PORT);
  console.log('The server is running on port', PORT);
}

bootstrap().catch((err) => {
  console.error('Failed to start the app:', err);
  process.exit(1);
});
