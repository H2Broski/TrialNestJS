import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt'; // <- add types
import { ConfigService } from '@nestjs/config';

type PublicUser = { id: number; username: string; role: string };
type Tokens = { access_token: string; refresh_token: string };
type TokenPayload = { sub: number; username: string; role: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getRefreshSecret(): string {
    return this.config.get<string>('JWT_REFRESH_TOKEN_SECRET') ?? 'refresh_secret';
  }
  private getRefreshTtl(): number | `${number}${'ms'|'s'|'m'|'h'|'d'|'w'|'y'}` {
    const raw = this.config.get<string>('REFRESH_TOKEN_EXPIRES_IN');
    if (!raw) return '7d';
    // pure number (seconds)
    if (/^\d+$/.test(raw)) return Number(raw);
    // duration string like 15m, 1h, 7d, etc.
    if (/^\d+(ms|s|m|h|d|w|y)$/.test(raw)) {
      return raw as `${number}${'ms'|'s'|'m'|'h'|'d'|'w'|'y'}`;
    }
    // fallback
    return '7d';
  }

  async validateUser(username: string, pass: string): Promise<PublicUser | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;
    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) return null;
    return { id: user.id, username: user.username, role: user.role };
  }

  async login(user: PublicUser): Promise<Tokens> {
    const payload: TokenPayload = { sub: user.id, username: user.username, role: user.role };

    const refreshSignOptions: JwtSignOptions = {
      secret: this.getRefreshSecret(),
      expiresIn: this.getRefreshTtl(),
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, refreshSignOptions);

    await this.usersService.setRefreshToken(user.id, refresh_token);
    return { access_token, refresh_token };
  }

  async logout(userId: number): Promise<{ ok: true }> {
    await this.usersService.setRefreshToken(userId, null);
    return { ok: true };
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const verifyOptions: JwtVerifyOptions = { secret: this.getRefreshSecret() };
      const decoded = this.jwtService.verify<TokenPayload>(refreshToken, verifyOptions);

      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      const stored = await this.usersService.getRefreshToken(user.id);
      if (!stored || stored !== refreshToken) throw new UnauthorizedException('Invalid refresh token');

      const payload: TokenPayload = { sub: user.id, username: user.username, role: user.role };
      const signOptions: JwtSignOptions = {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshTtl() as unknown as any,
      };

      const access_token = this.jwtService.sign(payload);
      const new_refresh_token = this.jwtService.sign(payload, signOptions);

      await this.usersService.setRefreshToken(user.id, new_refresh_token);
      return { access_token, refresh_token: new_refresh_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}

