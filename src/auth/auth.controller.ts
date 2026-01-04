import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { CreateAuthDto } from './dto/create-auth.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.regsterUser(createAuthDto);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.loginUser(body.email, body.password);
  }

  @Get('users')
  findAll() {
    return this.authService.findAllUsers();
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.authService.findOneUsers(id);
  }

  @Patch('users/:id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.updateOneUsers(id, updateAuthDto);
  }

  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.authService.deletUser(id);
  }
}
