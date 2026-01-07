import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

export default class extends Service<Env> {
  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}