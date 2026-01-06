import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import bcrypt from 'bcryptjs';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}
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

  async validateUserStatusAndRecover(user) {
    if (user.deletedAt) {
      const now = new Date();
      const deletedDate = new Date(user.deletedAt);

      const diffInDays = Math.floor((now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffInDays <= 60) {
        return await this.prisma.user.update({
          where: { id: user.id },
          data: {
            deletedAt: null,
            status: 'ACTIVE',
          },
        });
      } else {
        throw new Error('Account recovery period has expired.');
      }
    }
    return user;
  }

  async verifyOtpAndLogin(userId: string, otp: string, currentIp: string) {
    const savedOtp = await this.redisClient.get(`otp:${userId}`);

    if (!savedOtp || savedOtp !== otp) {
      throw new Error('Invalid or expired OTP');
    }

    await this.redisClient.del(`otp:${userId}`);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginIp: currentIp } as any,
    });

    const payload = { sub: user.id, email: user.email, status: user.status };
    const token = await this.jwtService.signAsync(payload);

    await this.redisClient.set(`session:${user.id}`, token);

    return {
      message: "OTP Verified. Login successful",
      access_token: token,
      user: { id: user.id, email: user.email }
    };
  }

  async loginUser(email: string, pass: string, currentIp: string) {
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
    const finalUser = await this.validateUserStatusAndRecover(user);


    if ((user as any).lastLoginIp as any && (user as any).lastLoginIp !== currentIp) {

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await this.redisClient.set(`otp:${finalUser.id}`, otp, 'EX', 300);

      console.log(`\n--- [SECURITY ALERT] ---`);
      console.log(`New Device/IP: ${currentIp}`);
      console.log(`User ID: ${finalUser.id}`);
      console.log(`Verification OTP: ${otp}`);
      console.log(`------------------------\n`);

      return {
        message: "New device or IP detected. OTP verification required.",
        requiresOtp: true,
        userId: finalUser.id
      };
    }

    await this.prisma.user.update({
      where: { id: finalUser.id },
      data: { lastLoginIp: currentIp } as any,
    });

    const payload = {
      sub: user.id, email: user.email, status: finalUser.status
    };
    const token = await this.jwtService.signAsync(payload);

    await this.redisClient.set(`session:${finalUser.id}`, token);

    return { message: "Login successful", access_token: token, user: { id: user.id, email: user.email, status: finalUser.status } };
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
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DORMANT',
      },
    });
  }
}
