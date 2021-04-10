import mongoose, { Schema } from 'mongoose';

const cardSchema = new Schema({
  term: String,
  definition: String,
  image: String
});

const setSchema = new Schema({
  title: String,
  description: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  cards: {
    type: [cardSchema],
    default: []
  }
});

const Set = mongoose.model('Set', setSchema);

export default Set;
