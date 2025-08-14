import mongoose from 'mongoose';

const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)[a-zA-Z0-9_-]{11}/;
  return youtubeRegex.test(url);
};

const videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome não pode exceder 200 caracteres']
  },
  url: {
    type: String,
    required: [true, 'URL é obrigatória'],
    validate: {
      validator: isValidYouTubeUrl,
      message: 'URL deve ser um link válido do YouTube'
    }
  },
  videoId: {
    type: String, // Extrair ID do vídeo do YouTube
    unique: true,
    sparse: true
  },
  thumbnail: String, // URL da thumbnail
  description: String, // Descrição opcional
  status: {
    type: String,
    enum: ['watched', 'later', 'learning'],
    default: 'learning',
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: String,
  dateAdded: {
    type: Date,
    default: Date.now
  },
  dateWatched: Date,
  collectionTags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      default: [],
    },
  ],
}, {
  timestamps: true
});

// Índices para performance
videoSchema.index({ status: 1, dateAdded: -1 });
videoSchema.index({ collectionTags: 1 });
videoSchema.index({ priority: -1 });
videoSchema.index({ difficulty: 1 });
videoSchema.index({ '$**': 'text' }); // Busca textual

// Middleware para extrair videoId antes de salvar
videoSchema.pre('save', function(next) {
  if (this.url && !this.videoId) {
    const match = this.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) {
      this.videoId = match[1];
    }
  }
  next();
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
