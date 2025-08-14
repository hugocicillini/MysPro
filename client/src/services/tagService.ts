import api from './api';

// Interfaces para tags
export interface TagData {
  name: string;
  color?: string;
  description?: string;
  category?: 'technology' | 'language' | 'framework' | 'concept' | 'other';
}

export interface Tag extends TagData {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TagFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Service para tags
export const tagService = {
  // Buscar todas as tags
  async getTags(filters?: TagFilters): Promise<TagsResponse> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/tags?${params.toString()}`);
    return response.data;
  },

  // Buscar tag por ID
  async getTagById(id: string): Promise<Tag> {
    const response = await api.get(`/tags/${id}`);
    return response.data;
  },

  // Criar nova tag
  async createTag(data: TagData): Promise<Tag> {
    const response = await api.post('/tags/create', data);
    return response.data;
  },

  // Atualizar tag
  async updateTag(id: string, data: Partial<TagData>): Promise<Tag> {
    const response = await api.put(`/tags/${id}`, data);
    return response.data;
  },

  // Deletar tag
  async deleteTag(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },

  // Estatísticas das tags
  async getTagStats(): Promise<any> {
    const response = await api.get('/tags/stats');
    return response.data;
  }
};
