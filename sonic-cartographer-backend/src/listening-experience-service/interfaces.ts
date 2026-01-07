export interface ListeningExperience {
  experienceId: string;
  recommendationId: string;
  albumId: string;
  userId: string;
  rating?: number;
  resonanceNotes?: string;
  createdAt: Date;
}
