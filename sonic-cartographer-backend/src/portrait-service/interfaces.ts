export interface Portrait {
  portraitId: string;
  userId: string;
  genres: string[];
  eras: string[];
  geographicCenters: string[];
  gaps: string[];
  createdAt: Date;
}

export interface GeneratePortraitRequest {
  userId: string;
  artistData: string;
  format: 'csv' | 'json';
}
