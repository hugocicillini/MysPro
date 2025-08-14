import { Request, Response } from 'express';
import { Tag } from '../models/tagsModel';
import Video from '../models/videoModel';
import { extractBasicYouTubeData } from '../utils/youtubeUtils';

// @desc    Criar novo video
// @route   POST /api/videos/create
export const createVideo = async (req: Request, res: Response) => {
  try {
    const {
      name,
      url,
      collectionTags,
      status,
      difficulty,
      priority,
      description,
      notes,
    } = req.body;

    // Extrair dados básicos do YouTube
    const youtubeData = extractBasicYouTubeData(url);

    // Buscar tags por nome
    const tagIds = await Tag.find({
      name: { $in: collectionTags || [] },
    }).select('_id');

    const newVideo = new Video({
      name: name || `Vídeo do YouTube`,
      url,
      videoId: youtubeData.videoId,
      thumbnail: youtubeData.thumbnail,
      description,
      collectionTags: tagIds,
      status: status || 'learning',
      difficulty: difficulty || 'beginner',
      priority: priority || 3,
      notes,
    });

    const savedVideo = await newVideo.save();
    const populatedVideo = await Video.findById(savedVideo._id).populate(
      'collectionTags'
    );

    return res.status(201).json(populatedVideo);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((e: any) => e.message),
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Este vídeo já foi adicionado',
      });
    }

    console.error('Erro ao criar vídeo:', error);
    return res.status(500).json({
      message: 'Erro interno do servidor',
    });
  }
};

// @desc    Trazer vídeos com paginação e filtros
// @route   GET /api/videos
export const getVideos = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sortBy = (req.query.sortBy as string) || 'dateAdded';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Filtros
    const filter: any = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.tags) {
      const tagNames = Array.isArray(req.query.tags)
        ? req.query.tags
        : [req.query.tags];
      const tags = await Tag.find({ name: { $in: tagNames } });
      filter.collectionTags = { $in: tags.map((tag) => tag._id) };
    }

    const [videosRaw, total] = await Promise.all([
      Video.find(filter)
        .populate('collectionTags')
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit),
      Video.countDocuments(filter),
    ]);

    // Processar vídeos para garantir que tenham videoId
    const videos = await Promise.all(
      videosRaw.map(async (video) => {
        if (!video.videoId && video.url) {
          try {
            const youtubeData = extractBasicYouTubeData(video.url);
            video.videoId = youtubeData.videoId;
            video.thumbnail = video.thumbnail || youtubeData.thumbnail;
            await video.save();
          } catch (error) {
            console.warn('Não foi possível extrair videoId da URL:', video.url);
          }
        }
        return video;
      })
    );

    return res.status(200).json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return res.status(500).json({
      message: 'Erro ao buscar vídeos',
    });
  }
};

// @desc    Busca avançada de vídeos
// @route   GET /api/videos/search
export const searchVideos = async (req: Request, res: Response) => {
  try {
    const {
      q,
      status,
      tags,
      difficulty,
      priority,
      page = 1,
      limit = 10,
      sortBy = 'dateAdded',
      order = 'desc',
    } = req.query;

    const filter: any = {};

    // Busca textual
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } },
      ];
    }

    // Filtros
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (priority) filter.priority = priority;

    if (tags) {
      const tagNames = Array.isArray(tags) ? tags : [tags];
      const tagObjects = await Tag.find({ name: { $in: tagNames } });
      filter.collectionTags = { $in: tagObjects.map((tag) => tag._id) };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [videos, total] = await Promise.all([
      Video.find(filter)
        .populate('collectionTags')
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Video.countDocuments(filter),
    ]);

    res.json({
      videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ message: 'Erro na busca de vídeos' });
  }
};

// @desc    Trazer video por id
// @route   GET /api/videos/:id
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      'collectionTags'
    );

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    // Se não tiver videoId, extrair da URL e salvar
    if (!video.videoId && video.url) {
      try {
        const youtubeData = extractBasicYouTubeData(video.url);
        video.videoId = youtubeData.videoId;
        video.thumbnail = video.thumbnail || youtubeData.thumbnail;
        await video.save();
      } catch (error) {
        console.warn('Não foi possível extrair videoId da URL:', video.url);
      }
    }

    return res.json(video);
  } catch (error) {
    console.error('Erro ao buscar vídeo:', error);
    return res.status(500).json({ message: 'Erro ao buscar vídeo' });
  }
};

// @desc    Editar video por id
// @route   PUT /api/videos/:id
export const EditVideoById = async (req: Request, res: Response) => {
  try {
    const {
      name,
      url,
      collectionTags,
      status,
      difficulty,
      priority,
      description,
      notes,
    } = req.body;

    // Buscar tags se fornecidas
    let tagIds: any[] = [];
    if (collectionTags && collectionTags.length > 0) {
      const tags = await Tag.find({ name: { $in: collectionTags } });
      tagIds = tags.map((tag) => tag._id);
    }

    const updateData: any = {
      name,
      status,
      difficulty,
      priority,
      description,
      notes,
    };

    // Se URL mudou, extrair novos dados do YouTube
    if (url) {
      const youtubeData = extractBasicYouTubeData(url);
      updateData.url = url;
      updateData.videoId = youtubeData.videoId;
      updateData.thumbnail = youtubeData.thumbnail;
    }

    if (tagIds.length > 0) {
      updateData.collectionTags = tagIds;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('collectionTags');

    if (!updatedVideo) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    return res.json(updatedVideo);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: Object.values(error.errors).map((e: any) => e.message),
      });
    }

    console.error('Erro ao editar vídeo:', error);
    return res.status(500).json({ message: 'Erro ao editar vídeo' });
  }
};

// @desc    Atualizar prioridade do vídeo
// @route   PATCH /api/videos/:id/priority
export const updatePriority = async (req: Request, res: Response) => {
  try {
    const { priority } = req.body;

    if (typeof priority !== 'number' || priority < 1 || priority > 5) {
      return res.status(400).json({
        message: 'Prioridade deve ser um número entre 1 e 5',
      });
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id, 
      { priority }, 
      { new: true }
    ).populate('collectionTags');

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(video);
  } catch (error) {
    console.error('Erro ao atualizar prioridade:', error);
    res.status(500).json({ message: 'Erro ao atualizar prioridade' });
  }
};

// @desc    Atualizar progresso do vídeo
// @route   PATCH /api/videos/:id/progress
export const updateProgress = async (req: Request, res: Response) => {
  try {
    const { progress } = req.body;

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({
        message: 'Progresso deve ser um número entre 0 e 100',
      });
    }

    const updateData: any = { progress };

    // Se progresso for 100%, marcar como assistido
    if (progress === 100) {
      updateData.status = 'watched';
      updateData.dateWatched = new Date();
    }

    const video = await Video.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).populate('collectionTags');

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(video);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ message: 'Erro ao atualizar progresso' });
  }
};

// @desc    Marcar vídeo como assistido
// @route   PATCH /api/videos/:id/watched
export const markAsWatched = async (req: Request, res: Response) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      {
        status: 'watched',
        progress: 100,
        dateWatched: new Date(),
      },
      { new: true }
    ).populate('collectionTags');

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(video);
  } catch (error) {
    console.error('Erro ao marcar como assistido:', error);
    res.status(500).json({ message: 'Erro ao marcar como assistido' });
  }
};

// @desc    Buscar vídeos por tag
// @route   GET /api/videos/by-tag/:tagId
export const getVideosByTag = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find({
      collectionTags: req.params.tagId,
    }).populate('collectionTags');

    res.json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos por tag:', error);
    res.status(500).json({ message: 'Erro ao buscar vídeos por tag' });
  }
};

// @desc    Estatísticas dos vídeos
// @route   GET /api/videos/stats
export const getVideoStats = async (req: Request, res: Response) => {
  try {
    const [
      totalVideos,
      watchedVideos,
      learningVideos,
      laterVideos,
      avgProgress,
      videosByDifficulty,
      videosByPriority,
      recentVideos,
    ] = await Promise.all([
      Video.countDocuments(),
      Video.countDocuments({ status: 'watched' }),
      Video.countDocuments({ status: 'learning' }),
      Video.countDocuments({ status: 'later' }),
      Video.aggregate([
        { $group: { _id: null, avgProgress: { $avg: '$progress' } } },
      ]),
      Video.aggregate([{ $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
      Video.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Video.find().sort({ dateAdded: -1 }).limit(5).populate('collectionTags'),
    ]);

    const stats = {
      total: totalVideos,
      byStatus: {
        watched: watchedVideos,
        learning: learningVideos,
        later: laterVideos,
      },
      averageProgress: avgProgress[0]?.avgProgress || 0,
      byDifficulty: videosByDifficulty.reduce((acc: any, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: videosByPriority.reduce((acc: any, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentVideos,
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas' });
  }
};

// @desc    Deletar video
// @route   DELETE /api/videos/:id
export const deleteVideoById = async (req: Request, res: Response) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);

    if (!deletedVideo) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    return res.json({
      message: 'Vídeo deletado com sucesso',
      video: deletedVideo,
    });
  } catch (error) {
    console.error('Erro ao deletar vídeo:', error);
    return res.status(500).json({ message: 'Erro ao deletar vídeo' });
  }
};
