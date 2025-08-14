import { Router } from 'express';
import { 
  createTag, 
  getTags, 
  getTagById, 
  updateTag, 
  deleteTag, 
  getTagStats 
} from '../controllers/tagController';
import { validateTagData } from '../utils/validation';

const route = Router();

// Estatísticas (deve vir antes das rotas com :id)
route.get('/stats', getTagStats);

// CRUD
route.get('/', getTags);
route.get('/:id', getTagById);
route.post('/create', validateTagData, createTag);
route.put('/:id', validateTagData, updateTag);
route.delete('/:id', deleteTag);

export default route;
