import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginInput: LoginInput, response: Response) {
    const user = await this.verifyUser(loginInput.email, loginInput.password);
    const expires = new Date();

    expires.setMilliseconds(
      expires.getTime() +
        parseInt(this.configService.getOrThrow('JWT_EXPIRATION_MS'))
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };

    const accessToken = this.jwtService.sign(tokenPayload);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires,
    });
    return user;
  }

  private async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });

      const authenticated = await compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException();
      }
      return user;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
