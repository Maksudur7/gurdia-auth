import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async regsterUser(createAuthDto: CreateAuthDto) {
    const result = await this.prisma.user.create({
      data: {
        name: createAuthDto.name,
        email: createAuthDto.email,
        password: createAuthDto.password,
        image: createAuthDto.imageUrl,
      },
    });
    console.log(result);
    return result;
  }

  async loginUser(email: string, password: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        password,
      },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany();
  }

  async findOneUsers(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateOneUsers(id: string, updateAuthDto: UpdateAuthDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        name: updateAuthDto.name,
        email: updateAuthDto.email,
        password: updateAuthDto.password,
        image: updateAuthDto.imageUrl,
      },
    });
  }

  async deletUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
