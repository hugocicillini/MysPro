import { Request, Response, NextFunction } from 'express';

// Interface para erro customizado
interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
}

// Middleware de tratamento de erros global
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  console.error('Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message);
    error = {
      ...error,
      statusCode: 400,
      message: 'Dados inválidos'
    };
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: message
    });
  }

  // Erro de Cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = {
      ...error,
      statusCode: 404,
      message
    };
    return res.status(404).json({
      success: false,
      message
    });
  }

  // Erro de chave duplicada do MongoDB
  if (err.code === 11000) {
    const message = 'Recurso já existe';
    error = {
      ...error,
      statusCode: 400,
      message
    };
    return res.status(400).json({
      success: false,
      message
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor'
  });
};

// Middleware para capturar rotas não encontradas
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Middleware de log de requisições
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
};
