import { Request, Response } from 'express';
import { Tag } from '../models/tagsModel';

// @desc    Criar nova tag
// @route   POST /api/tags/create
export const createTag = async (req: Request, res: Response) => {
  try {
    const newTag = new Tag(req.body);

    const savedTag = await newTag.save();

    return res.status(201).json(savedTag);
  } catch (error) {
    console.error('Erro ao salvar a tag:', error);
    return res
      .status(400)
      .json({ message: 'Erro ao criar a tag', error: error as Error });
  }
};

// @desc    Trazer tags
// @route   GET /api/tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await Tag.find();
    return res.status(200).json(tags);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Erro ao buscar tags', error: error as Error });
  }
};
