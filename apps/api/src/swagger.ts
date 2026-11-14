import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function createOpenApiDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Projet AVENIR — Rikolto RDC API')
    .setDescription(
      'API de la boîte à outils interactive d’éducation entrepreneuriale et du simulateur économique agricole (Provinces du Kwilu et du Kwango).'
    )
    .setVersion('1.0.0')
    .build();

  return SwaggerModule.createDocument(app, config);
}

