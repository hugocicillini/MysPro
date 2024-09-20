import { Router } from 'express';
import {
  createVideo,
  deleteVideoById,
  EditVideoById,
  getVideoById,
  getVideos,
} from '../controllers/videoController';

const route = Router();

route.get('/', getVideos);

route.get('/:id', getVideoById);

route.post('/create', createVideo);

route.put('/:id', EditVideoById);

route.delete('/:id', deleteVideoById);

export default route;
