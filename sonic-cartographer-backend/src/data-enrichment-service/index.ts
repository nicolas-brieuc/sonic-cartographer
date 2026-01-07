import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';

interface SearchAlbumsRequest {
  genre?: string;
  style?: string;
  year?: string;
  country?: string;
  limit?: number;
}

interface DiscogsRelease {
  id: number;
  title: string;
  year: string;
  genre?: string[];
  style?: string[];
  country?: string;
  master_id?: number;
  type: string;
}

interface Album {
  discogsId: number;
  title: string;
  artist: string;
  year: string;
  genres: string[];
  country?: string;
}

export default class extends Service<Env> {
  async searchAlbums(request: SearchAlbumsRequest): Promise<Album[]> {
    this.env.logger.info('Searching albums on Discogs', {
      genre: request.genre,
      style: request.style,
      country: request.country,
      limit: request.limit,
    });

    try {
      // Build Discogs search query
      const params = new URLSearchParams();
      params.append('type', 'master'); // Search for master releases (canonical albums)
      params.append('format', 'album');

      if (request.genre) params.append('genre', request.genre);
      if (request.style) params.append('style', request.style);
      if (request.year) params.append('year', request.year);
      if (request.country) params.append('country', request.country);

      params.append('per_page', String(request.limit || 20));

      const url = `https://api.discogs.com/database/search?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Discogs token=${this.env.DISCOGS_API_KEY}`,
          'User-Agent': 'SonicCartographer/1.0 +https://soniccartographer.com',
        },
      });

      if (!response.ok) {
        throw new Error(`Discogs API error: ${response.status}`);
      }

      const data: any = await response.json();
      const results = (data.results || []) as DiscogsRelease[];

      // Map to our Album format
      const albums: Album[] = results
        .filter((r: DiscogsRelease) => r.type === 'master' && r.title && r.year)
        .map((r: DiscogsRelease) => {
          // Extract artist from title (format is usually "Artist - Album")
          const parts = (r.title || '').split(' - ');
          const artist = parts.length > 1 && parts[0] ? parts[0].trim() : 'Unknown Artist';
          const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : (r.title || 'Unknown Album');

          return {
            discogsId: r.master_id || r.id,
            title,
            artist,
            year: r.year,
            genres: r.genre || [],
            country: r.country,
          };
        });

      this.env.logger.info('Found albums on Discogs', {
        count: albums.length,
        query: request,
      });

      return albums;
    } catch (error) {
      this.env.logger.error('Failed to search Discogs', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return [];
    }
  }

  async fetch(): Promise<Response> {
    return new Response('Not implemented', { status: 501 });
  }
}