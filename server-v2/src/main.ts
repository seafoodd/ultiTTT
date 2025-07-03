import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const env = configService.get<string>('ENV') || 'production';

  const allowedOrigins =
    env === 'development'
      ? ['http://localhost:5173']
      : [configService.get<string>('DOMAIN_URL') || 'https://ultittt.org'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

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

  await app.listen(5000);
  console.log('The server is running on port 5000');
}

bootstrap().catch((err) => {
  console.error('Failed to start the app:', err);
  process.exit(1);
});
