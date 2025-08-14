import { Request, Response, NextFunction } from 'express';
import { isValidYouTubeUrl } from '../utils/youtubeUtils';

// Middleware para validar dados de vídeo
export const validateVideoData = (req: Request, res: Response, next: NextFunction) => {
  const { name, url, status, difficulty, priority } = req.body;
  
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }
  
  if (name && name.length > 200) {
    errors.push('Nome não pode exceder 200 caracteres');
  }
  
  if (!url || typeof url !== 'string') {
    errors.push('URL é obrigatória');
  } else if (!isValidYouTubeUrl(url)) {
    errors.push('URL deve ser um link válido do YouTube');
  }
  
  if (status && !['watched', 'later', 'learning'].includes(status)) {
    errors.push('Status deve ser: watched, later ou learning');
  }
  
  if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
    errors.push('Dificuldade deve ser: beginner, intermediate ou advanced');
  }
  
  if (priority && (typeof priority !== 'number' || priority < 1 || priority > 5)) {
    errors.push('Prioridade deve ser um número entre 1 e 5');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors
    });
  }
  
  next();
};

// Middleware para validar dados de tag
export const validateTagData = (req: Request, res: Response, next: NextFunction) => {
  const { name, color, category } = req.body;
  
  const errors: string[] = [];
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Nome da tag é obrigatório');
  }
  
  if (name && name.length > 50) {
    errors.push('Nome da tag não pode exceder 50 caracteres');
  }
  
  if (color && typeof color !== 'string') {
    errors.push('Cor deve ser uma string válida');
  }
  
  if (category && !['technology', 'language', 'framework', 'concept', 'other'].includes(category)) {
    errors.push('Categoria deve ser: technology, language, framework, concept ou other');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Dados inválidos',
      errors
    });
  }
  
  next();
};

// Middleware para validar parâmetros de busca
export const validateSearchParams = (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, sortBy, order } = req.query;
  
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    return res.status(400).json({
      message: 'Página deve ser um número maior que 0'
    });
  }
  
  if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
    return res.status(400).json({
      message: 'Limite deve ser um número entre 1 e 100'
    });
  }
  
  const validSortFields = ['name', 'dateAdded', 'priority', 'status', 'difficulty', 'progress'];
  if (sortBy && !validSortFields.includes(sortBy as string)) {
    return res.status(400).json({
      message: `Campo de ordenação deve ser um dos: ${validSortFields.join(', ')}`
    });
  }
  
  if (order && !['asc', 'desc'].includes(order as string)) {
    return res.status(400).json({
      message: 'Ordem deve ser: asc ou desc'
    });
  }
  
  next();
};
