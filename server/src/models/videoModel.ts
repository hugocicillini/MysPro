import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['watched', 'later', 'learning'],
    default: 'learning',
  },
  collectionTags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
      default: [],
    },
  ],
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
