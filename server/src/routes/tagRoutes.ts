import { Router } from 'express';
import { createTag, getTags } from '../controllers/tagController';

const route = Router();

route.get('/', getTags);

route.post('/create', createTag);

export default route;
