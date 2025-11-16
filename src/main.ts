import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // Kita akan pakai ini nanti
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Mengaktifkan shutdown hooks untuk Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // (Opsional) Mengaktifkan validasi DTO secara global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const frontendOriginEnv =
    process.env.FRONTEND_ORIGINS ??
    process.env.FRONTEND_ORIGIN ??
    'http://localhost:3000';

  const allowedOrigins = frontendOriginEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const corsOrigin = allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins;
  // Mengaktifkan CORS untuk frontend
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const uploadsDir = process.env.UPLOADS_DIR
    ? join(process.cwd(), process.env.UPLOADS_DIR)
    : join(process.cwd(), 'uploads');


  // Setup Swagger (Dokumentasi API)
  const config = new DocumentBuilder()
    .setTitle('BBI Backend API')
    .setDescription('API untuk CMS Bosowa Bandar Indonesia')
    .setVersion('1.0')
    .addBearerAuth() // Menambahkan otorisasi JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Akses di /api/docs

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
  const appUrl = await app.getUrl();
  console.log(`Aplikasi berjalan di: ${appUrl}`);
  console.log(`Dokumentasi API tersedia di: ${appUrl}/api/docs`);
  console.log(
    `Frontend yang diizinkan mengakses: ${Array.isArray(corsOrigin) ? corsOrigin.join(', ') : corsOrigin}`,
  );
}
bootstrap();
