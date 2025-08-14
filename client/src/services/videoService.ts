import api from './api';
import { VideoProps } from '../lib/types';

// Interfaces para os dados da API melhorada
export interface CreateVideoData {
  name: string;
  url: string;
  collectionTags?: string[];
  status?: 'learning' | 'watched' | 'later';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  priority?: number;
  description?: string;
  notes?: string;
}

export interface UpdateVideoData extends Partial<CreateVideoData> {
  progress?: number;
  dateWatched?: string;
}

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

export interface VideosResponse {
  videos: VideoProps[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Extrair ID do YouTube da URL
export const extractYouTubeId = (url: string): string => {
  return url
    .replace('https://www.youtube.com/watch?v=', '')
    .replace('https://youtu.be/', '')
    .split('&')[0];
};

// Service para vídeos
export const videoService = {
  // Buscar todos os vídeos com filtros
  async getVideos(filters?: VideoFilters): Promise<VideosResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/videos?${params.toString()}`);
    return response.data;
  },

  // Buscar vídeo por ID
  async getVideoById(id: string): Promise<VideoProps> {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  // Criar novo vídeo
  async createVideo(data: CreateVideoData): Promise<VideoProps> {
    // Processar URL do YouTube
    const processedData = {
      ...data,
      url: data.url.includes('youtube.com') || data.url.includes('youtu.be') 
        ? data.url 
        : data.url
    };

    const response = await api.post('/videos/create', processedData);
    return response.data;
  },

  // Atualizar vídeo
  async updateVideo(id: string, data: UpdateVideoData): Promise<VideoProps> {
    const response = await api.put(`/videos/${id}`, data);
    return response.data;
  },

  // Deletar vídeo
  async deleteVideo(id: string): Promise<void> {
    await api.delete(`/videos/${id}`);
  },

  // Busca avançada
  async searchVideos(query: string, filters?: VideoFilters): Promise<VideosResponse> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await api.get(`/videos/search?${params.toString()}`);
    return response.data;
  },

  // Atualizar prioridade
  async updatePriority(id: string, priority: number): Promise<VideoProps> {
    const response = await api.patch(`/videos/${id}/priority`, { priority });
    return response.data;
  },

  // Atualizar progresso
  async updateProgress(id: string, progress: number): Promise<VideoProps> {
    const response = await api.patch(`/videos/${id}/progress`, { progress });
    return response.data;
  },

  // Marcar como assistido
  async markAsWatched(id: string): Promise<VideoProps> {
    const response = await api.patch(`/videos/${id}/watched`);
    return response.data;
  },

  // Buscar vídeos por tag
  async getVideosByTag(tagId: string): Promise<VideoProps[]> {
    const response = await api.get(`/videos/by-tag/${tagId}`);
    return response.data;
  },

  // Estatísticas dos vídeos
  async getVideoStats(): Promise<any> {
    const response = await api.get('/videos/stats');
    return response.data;
  }
};
