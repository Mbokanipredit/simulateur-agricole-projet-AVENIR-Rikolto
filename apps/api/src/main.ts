import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import { AppModule } from './app.module';
import { createOpenApiDocument } from './swagger';
import { auth } from './auth/auth.instance';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Mount BetterAuth standard endpoints at /api/auth/*
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.all('/api/auth/*splat', toNodeHandler(auth));

  const document = createOpenApiDocument(app);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log(`🚀 Projet AVENIR API running on http://localhost:${port}`);
  console.log(`📘 OpenAPI Docs available on http://localhost:${port}/api/docs`);
}

bootstrap();

