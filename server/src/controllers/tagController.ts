import { Request, Response } from 'express';
import { Tag } from '../models/tagsModel';
import Video from '../models/videoModel';

// @desc    Criar nova tag
// @route   POST /api/tags/create
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color, description, category } = req.body;

    // Verificar se tag já existe
    const existingTag = await Tag.findOne({ 
      name: name.toLowerCase().trim() 
    });

    if (existingTag) {
      return res.status(400).json({ 
        message: 'Tag já existe' 
      });
    }

    const newTag = new Tag({
      name: name.toLowerCase().trim(),
      color,
      description,
      category
    });

    const savedTag = await newTag.save();

    return res.status(201).json(savedTag);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((e: any) => e.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Tag já existe'
      });
    }

    console.error('Erro ao criar tag:', error);
    return res.status(500).json({ 
      message: 'Erro interno do servidor' 
    });
  }
};

// @desc    Trazer tags com paginação e filtros
// @route   GET /api/tags
export const getTags = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const search = req.query.search as string;

    // Construir filtro
    const filter: any = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [tags, total] = await Promise.all([
      Tag.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit),
      Tag.countDocuments(filter)
    ]);

    return res.status(200).json({
      tags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return res.status(500).json({ 
      message: 'Erro ao buscar tags' 
    });
  }
};

// @desc    Buscar tag por ID
// @route   GET /api/tags/:id
export const getTagById = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag não encontrada' });
    }

    // Buscar vídeos associados
    const videos = await Video.find({ 
      collectionTags: req.params.id 
    }).select('name url status');

    res.json({
      tag,
      videos,
      videoCount: videos.length
    });
  } catch (error) {
    console.error('Erro ao buscar tag:', error);
    res.status(500).json({ message: 'Erro ao buscar tag' });
  }
};

// @desc    Editar tag
// @route   PUT /api/tags/:id
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { name, color, description, category } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name.toLowerCase().trim();
    if (color) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;

    const updatedTag = await Tag.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTag) {
      return res.status(404).json({ message: 'Tag não encontrada' });
    }

    res.json(updatedTag);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((e: any) => e.message)
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Tag com este nome já existe'
      });
    }

    console.error('Erro ao editar tag:', error);
    res.status(500).json({ message: 'Erro ao editar tag' });
  }
};

// @desc    Deletar tag
// @route   DELETE /api/tags/:id
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: 'Tag não encontrada' });
    }

    // Verificar se tag está sendo usada
    const videosWithTag = await Video.countDocuments({ 
      collectionTags: req.params.id 
    });

    if (videosWithTag > 0) {
      return res.status(400).json({ 
        message: `Não é possível deletar a tag. Ela está sendo usada em ${videosWithTag} vídeo(s).`,
        videosCount: videosWithTag
      });
    }

    await Tag.findByIdAndDelete(req.params.id);

    res.json({ 
      message: 'Tag deletada com sucesso',
      tag 
    });
  } catch (error) {
    console.error('Erro ao deletar tag:', error);
    res.status(500).json({ message: 'Erro ao deletar tag' });
  }
};

// @desc    Estatísticas das tags
// @route   GET /api/tags/stats
export const getTagStats = async (req: Request, res: Response) => {
  try {
    const [
      totalTags,
      tagsByCategory,
      mostUsedTags,
      unusedTags
    ] = await Promise.all([
      Tag.countDocuments(),
      Tag.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Video.aggregate([
        { $unwind: '$collectionTags' },
        { 
          $group: { 
            _id: '$collectionTags', 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'tags',
            localField: '_id',
            foreignField: '_id',
            as: 'tag'
          }
        },
        { $unwind: '$tag' },
        {
          $project: {
            name: '$tag.name',
            color: '$tag.color',
            count: 1
          }
        }
      ]),
      Tag.aggregate([
        {
          $lookup: {
            from: 'videos',
            localField: '_id',
            foreignField: 'collectionTags',
            as: 'videos'
          }
        },
        {
          $match: {
            videos: { $size: 0 }
          }
        },
        {
          $project: {
            name: 1,
            color: 1,
            category: 1
          }
        }
      ])
    ]);

    const stats = {
      total: totalTags,
      byCategory: tagsByCategory.reduce((acc: any, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      mostUsed: mostUsedTags,
      unused: unusedTags
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas das tags:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas das tags' });
  }
};
