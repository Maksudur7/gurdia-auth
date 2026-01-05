import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async regsterUser(createAuthDto: CreateAuthDto) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(createAuthDto.password, salt);
    const result = await this.prisma.user.create({
      data: {
        name: createAuthDto.name,
        email: createAuthDto.email,
        password: hashPassword,
        image: createAuthDto.imageUrl,
      },
    });
    console.log(result);
    return result;
  }

  async loginUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Unauthorized access");
    }
    const userPass = user.password;
    const passMatch = await bcrypt.compareSync(pass, userPass as string);

    if (!passMatch) {
      throw new Error("Wrong password");
    }

    console.log(user);
    return user;
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
