import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da tag é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Nome da tag não pode exceder 50 caracteres']
  },
  color: {
    type: String,
    default: '#3B82F6' // Cor para UI
  },
  description: String,
  category: {
    type: String,
    enum: ['technology', 'language', 'framework', 'concept', 'other'],
    default: 'other'
  }
}, {
  timestamps: true
});

// Índice para busca textual
tagSchema.index({ name: 'text', description: 'text' });

export const Tag = mongoose.model('Tag', tagSchema);
