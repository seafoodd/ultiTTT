import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EnvConfig } from '@/core/config/env.config';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const envConfig = app.get(EnvConfig);

  const allowedOrigins = envConfig.isDevelopment
    ? ['http://localhost:5173']
    : [envConfig.getEnvVarOrThrow('DOMAIN_URL')];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Retry-After'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (validationErrors = []) => {
        const firstMessage =
          validationErrors
            .map((err) =>
              err.constraints ? Object.values(err.constraints)[0] : null,
            )
            .filter((msg) => msg)[0] || 'Validation failed';

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: firstMessage,
        });
      },
    }),
  );

  const PORT = envConfig.getEnvVar('PORT') || 5000;

  const config = new DocumentBuilder()
    .setTitle('ultiTTT API')
    .setDescription('ultiTTT API docs.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    operationIdFactory: (controllerKey, methodKey) => methodKey,
  });

  document.tags = [
    { name: 'Auth', description: 'Authentication related endpoints' },
  ];

  SwaggerModule.setup('', app, document, {
    jsonDocumentUrl: 'api-json',
  });

  document.servers = [
    {
      url: envConfig.isDevelopment
        ? 'http://localhost:5001'
        : `${envConfig.getEnvVarOrThrow('DOMAIN_URL')}}/api`,
      description: 'ultiTTT server',
    },
  ];

  await app.listen(PORT);
  console.log('The server is running on port', PORT);
}

bootstrap().catch((err) => {
  console.error('Failed to start the app:', err);
  process.exit(1);
});
