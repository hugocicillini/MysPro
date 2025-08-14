import { Router } from 'express';
import {
  createVideo,
  deleteVideoById,
  EditVideoById,
  getVideoById,
  getVideos,
  searchVideos,
  getVideosByTag,
  updateProgress,
  updatePriority,
  markAsWatched,
  getVideoStats
} from '../controllers/videoController';
import { validateVideoData, validateSearchParams } from '../utils/validation';

const route = Router();

// Estatísticas (deve vir antes das rotas com :id)
route.get('/stats', getVideoStats);

// Busca avançada
route.get('/search', validateSearchParams, searchVideos);

// Vídeos por tag
route.get('/by-tag/:tagId', getVideosByTag);

// CRUD básico
route.get('/', validateSearchParams, getVideos);
route.get('/:id', getVideoById);
route.post('/create', validateVideoData, createVideo);
route.put('/:id', validateVideoData, EditVideoById);
route.delete('/:id', deleteVideoById);

// Funcionalidades específicas
route.patch('/:id/priority', updatePriority);
route.patch('/:id/progress', updateProgress);
route.patch('/:id/watched', markAsWatched);

export default route;
