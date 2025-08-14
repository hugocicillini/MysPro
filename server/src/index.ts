import cors from 'cors';
import express from 'express';
import connectDB from './config/db';

// Importar rotas
import tagRoutes from './routes/tagRoutes';
import videoRoutes from './routes/videoRoutes';

// Importar middlewares
import { errorHandler, notFound, requestLogger } from './utils/errorHandler';

// Conectar ao banco de dados
connectDB();

const app = express();

// Middlewares globais
app.use(express.json({ limit: '10mb' })); // Middleware para parsing JSON
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Middleware para parsing URL-encoded

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Middleware de log (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Rota de health check
app.get('/', (req, res) => {
  res.json({
    message: 'MysPro API está funcionando!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      videos: '/api/videos',
      tags: '/api/tags',
    },
  });
});

// Rota de health check para monitoramento
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
app.use('/api/videos', videoRoutes);
app.use('/api/tags', tagRoutes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
  console.log(
    `📚 MysPro API v2.0.0 rodando em modo ${
      process.env.NODE_ENV || 'development'
    }`
  );
});
