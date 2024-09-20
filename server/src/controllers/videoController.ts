import { Request, Response } from 'express';
import Video from '../models/videoModel';
import { Tag } from '../models/tagsModel';

// @desc    Criar novo video
// @route   POST /api/videos/create
export const createVideo = async (req: Request, res: Response) => {
  try {
    const { name, url, collectionTags, status } = req.body;

    const tagIds = await Tag.find({ name: { $in: collectionTags } }).select(
      '_id'
    );

    const newVideo = new Video({
      name,
      url,
      collectionTags: tagIds,
      status,
    });

    const savedVideo = await newVideo.save();
    return res.status(201).json(savedVideo);
  } catch (error) {
    console.error('Erro ao salvar o vídeo:', error);
    return res
      .status(400)
      .json({ message: 'Erro ao criar o vídeo', error: error as Error });
  }
};

// @desc    Trazer vídeos
// @route   GET /api/videos
export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find({}).populate('collectionTags');
    return res.status(200).json(videos);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Erro ao buscar vídeos', error: error as Error });
  }
};

// @desc    Trazer video por id
// @route   GET /api/videos/:id
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const video = await Video.findById(req.params.id).populate(
      'collectionTags',
      'name'
    );
    return res.json(video);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro ao buscar vídeo' });
  }
};

// @desc    Trazer videos por id
// @route   PUT /api/videos/:id
export const EditVideoById = async (req: Request, res: Response) => {
  try {
    const { name, url, collectionTags, status } = req.body;
    const tags = await Tag.find({ name: { $in: collectionTags } });
    const tagIds = tags.map((tag) => tag._id);

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        name,
        url,
        status,
        collectionTags: tagIds,
      },
      { new: true }
    );

    return res.json(updatedVideo);
  } catch (error) {
    console.log(error);
  }
};

// @desc    Deletar video
// @route   DELETE /api/videos/:id
export const deleteVideoById = async (req: Request, res: Response) => {
  try {
    const deletedVideo = await Video.findByIdAndDelete(req.params.id);

    return res.json(deletedVideo);
  } catch (error) {
    console.log(error);
  }
};
