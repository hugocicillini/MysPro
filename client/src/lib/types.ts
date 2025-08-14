export type VideoProps = {
  _id?: string;
  name: string;
  url: string;
  videoId?: string;
  thumbnail?: string;
  description?: string;
  status: 'learning' | 'watched' | 'later';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  priority?: number;
  notes?: string;
  progress?: number;
  dateAdded?: string;
  dateWatched?: string;
  collectionTags: Array<{ _id?: string; name: string; color?: string }>;
  createdAt?: string;
  updatedAt?: string;
};
