import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import { registerUser, loginUser, validateToken as validateTokenUtil } from './utils';
import type { RegisterUserRequest, LoginUserRequest, AuthResponse, TokenPayload } from './interfaces';

export default class extends Service<Env> {
  async register(data: RegisterUserRequest): Promise<AuthResponse> {
    return registerUser(data, this.env);
  }

  async login(data: LoginUserRequest): Promise<AuthResponse> {
    return loginUser(data, this.env);
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    return validateTokenUtil(token, this.env);
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}