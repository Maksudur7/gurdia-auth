import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // @Global দিলে বারবার অন্য মডিউলে ইমপোর্ট করার ঝামেলা থাকবে না
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // অন্য মডিউলে ব্যবহারের অনুমতি দিচ্ছে
})
export class PrismaModule {}