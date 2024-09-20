import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

export const Tag = mongoose.model('Tag', tagSchema);
