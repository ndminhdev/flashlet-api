import mongoose, { Schema } from 'mongoose';

const cardSchema = new Schema({
  term: String,
  definition: String,
  image: String,
});

const setSchema = new Schema({
  title: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
  cards: [cardSchema],
});

const Set = mongoose.model('Set', setSchema);

export default Set;
