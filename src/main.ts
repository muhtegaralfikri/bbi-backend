import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // Kita akan pakai ini nanti

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mengaktifkan shutdown hooks untuk Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // (Opsional) Mengaktifkan validasi DTO secara global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true,
    transform: true,
   }));
  
  // Mengaktifkan CORS
  app.enableCors();

  // Setup Swagger (Dokumentasi API)
  const config = new DocumentBuilder()
    .setTitle('BBI Backend API')
    .setDescription('API untuk CMS Bosowa Bandar Indonesia')
    .setVersion('1.0')
    .addBearerAuth() // Menambahkan otorisasi JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Akses di /api/docs

  await app.listen(process.env.PORT || 3000);
  console.log(`Aplikasi berjalan di: ${await app.getUrl()}`);
  console.log(`Dokumentasi API tersedia di: ${await app.getUrl()}/api/docs`);
}
bootstrap();