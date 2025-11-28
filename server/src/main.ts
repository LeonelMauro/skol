import * as crypto from 'crypto';
(globalThis as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  if (dataSource.isInitialized) {
    console.log('Conectado a la base datos');
  } else {
    console.log('NO se conecto a la base de datos');
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
