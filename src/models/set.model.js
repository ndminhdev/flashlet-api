import mongoose, { Schema } from 'mongoose';

const cardSchema = new Schema({
  term: String,
  definition: String,
  image: String
});

const setSchema = new Schema(
  {
    title: String,
    description: String,
    userId: Schema.Types.ObjectId,
    isPublic: {
      type: Boolean,
      default: false
    },
    cards: {
      type: [cardSchema],
      default: []
    }
  },
  { timestamps: true }
);

const Set = mongoose.model('Set', setSchema);

export default Set;
