import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  term: String,
  definition: String,
  imageUrl: String,
  setId: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

const Card = mongoose.model('Card', schema);

export default Card;
