import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) { }
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

    const payload = { sub: result.id, email: result.email };
    const token = await this.jwtService.signAsync(payload);
    return { message: 'User created successfully', access_token: token, user: { id: result.id, email: result.email } };
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

    const payload = { sub: user.id, email: user.email };
    const token = await this.jwtService.signAsync(payload);
    return { message: "Login successful", access_token: token, user: { id: user.id, email: user.email } };
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
