// Tipos para o modelo de Vídeo
export interface IVideo {
  _id?: string;
  name: string;
  url: string;
  videoId?: string;
  thumbnail?: string;
  description?: string;
  status: 'watched' | 'later' | 'learning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  priority: number;
  notes?: string;
  progress: number;
  dateAdded: Date;
  dateWatched?: Date;
  estimatedTime?: number;
  collectionTags: string[] | ITag[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para o modelo de Tag
export interface ITag {
  _id?: string;
  name: string;
  color: string;
  description?: string;
  category: 'technology' | 'language' | 'framework' | 'concept' | 'other';
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para respostas da API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Tipos para filtros de busca
export interface VideoFilters {
  status?: string;
  difficulty?: string;
  priority?: number;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface TagFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Tipos para estatísticas
export interface VideoStats {
  total: number;
  byStatus: {
    watched: number;
    learning: number;
    later: number;
  };
  averageProgress: number;
  totalEstimatedTime: number;
  byDifficulty: Record<string, number>;
  byPriority: Record<string, number>;
  recentVideos: IVideo[];
}

export interface TagStats {
  total: number;
  byCategory: Record<string, number>;
  mostUsed: Array<{
    name: string;
    color: string;
    count: number;
  }>;
  unused: ITag[];
}

// Tipos para relatórios
export interface LearningReport {
  period: string;
  summary: {
    totalVideos: number;
    completedVideos: number;
    inProgressVideos: number;
    completionRate: number;
    averageProgress: number;
    totalTimeSpent: number;
  };
  progressByTag: Array<{
    _id: string;
    averageProgress: number;
    totalVideos: number;
    completedVideos: number;
  }>;
  progressOverTime: Array<{
    _id: {
      year: number;
      month: number;
      day: number;
    };
    videosAdded: number;
    videosCompleted: number;
    averageProgress: number;
  }>;
}

// Tipos para sugestões
export interface VideoSuggestions {
  highPriority: IVideo[];
  forReview: IVideo[];
  inProgress: IVideo[];
}

// Tipos para dados do YouTube
export interface YouTubeData {
  videoId: string;
  thumbnail: string;
  embedUrl: string;
  watchUrl: string;
  title?: string;
  description?: string;
}

// Tipos para importação de playlist
export interface PlaylistImportData {
  playlistUrl: string;
  defaultTags?: string[];
  defaultStatus?: 'watched' | 'later' | 'learning';
}

export interface PlaylistImportResult {
  message: string;
  imported: number;
  skipped: number;
  videos: IVideo[];
}

// Tipos para exportação de dados
export interface ExportData {
  exportDate: string;
  version: string;
  data: {
    videos: IVideo[];
    tags: ITag[];
  };
  stats: {
    totalVideos: number;
    totalTags: number;
  };
}
