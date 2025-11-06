import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    await this.ensureDefaultAdmin();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // Prisma's library engine no longer forwards the beforeExit event via $on,
    // so we hook into Node's process event directly to close the Nest app gracefully.
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  private async ensureDefaultAdmin() {
    const email = 'admin@gmail.com';
    const existingAdmin = await this.admin.findUnique({ where: { email } });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('12345678', 10);

      await this.admin.create({
        data: {
          email,
          nama_lengkap: 'admin',
          password_hash: passwordHash,
        },
      });
    }
  }
}
