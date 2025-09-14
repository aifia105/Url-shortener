import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = config.get<number>('PORT');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(port);
  console.log(
    '--------------------------------------------------------------------------------------',
  );
  console.log(
    `Server running on port ${port} and you can access the API at http://localhost:${port}`,
  );
  console.log(
    '--------------------------------------------------------------------------------------',
  );
  console.log(
    `Swagger documentation available at http://localhost:${port}/api`,
  );
  console.log(
    '--------------------------------------------------------------------------------------',
  );
  console.log(
    `MongoDB connection string: ${config.get<string>('MONGODB_URI')}`,
  );
  console.log(
    '--------------------------------------------------------------------------------------',
  );
}
bootstrap();
