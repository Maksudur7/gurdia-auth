import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PolicyGuard } from '../common/guards/policy.guard.js';
import { SessionGuard } from '../common/guards/session.guard.js';
import { Roles } from '../../src/common/decorators/roles.decorator.js';
import { RolesGuard } from '../../src/common/guards/roles.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto, @Ip() ip: string) {
    return this.authService.regsterUser(createAuthDto, ip);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }, @Req() request: { ip: string }) {
    return this.authService.loginUser(body.email, body.password, request.ip);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { userId: string, otp: string }, @Req() request: { ip: string }) {
    return this.authService.verifyOtpAndLogin(body.userId, body.otp, request.ip);
  }

  @Get('users')
  @Roles('ADMIN')
  @UseGuards(PolicyGuard, SessionGuard)
  findAll() {
    return this.authService.findAllUsers();
  }

  @Get('users/:id')
  @UseGuards(PolicyGuard)
  findOne(@Param('id') id: string) {
    return this.authService.findOneUsers(id);
  }

  @Patch('users/:id')
  @UseGuards(PolicyGuard)
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updateOneUsers(id, updateAuthDto);
  }

  @Delete('users/:id')
  remove(
    @Req() req: any,
    @Ip() ip: string
  ) {
    const userId = req.user.id;
    return this.authService.deletUser(userId, ip);
  }

  @Delete('delete-user/:id')
  @Roles('ADMIN')
  removeUser(
    @Param('id') targetId: string,
    @Req() req: any,
    @Ip() ip: string
  ) {
    const adminId = req.user.id;
    return this.authService.deleteUserByAdmin(targetId, adminId, ip);
  }

  @Get('audit-logs')
  @Roles('ADMIN')
  @UseGuards(SessionGuard, RolesGuard)
  getLogs() {
    return this.authService.getAuditLog();
  }

  // just test for admin 

  @Get('admin-only-data')
  @Roles('ADMIN') // শুধু ADMIN এক্সেস পাবে
  @UseGuards(SessionGuard, RolesGuard)
  getAdminData() {
    return { message: "Welcome, Admin!" };
  }
}
