export interface Recommendation {
  recommendationId: string;
  conversationId: string;
  albums: Album[];
  reasoning: string;
}

export interface Album {
  albumId: string;
  title: string;
  artist: string;
  year: number;
  coverImageUrl?: string;
  reviewLinks?: string[];
}
