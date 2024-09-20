import cors from 'cors';
import express from 'express';
import connectDB from './config/db';

import videoRoutes from './routes/videoRoutes';
import tagRoutes from './routes/tagRoutes';

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/videos', videoRoutes);
app.use('/api/tags', tagRoutes);

app.get('/', (req, res) => {
  res.send('Server running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});