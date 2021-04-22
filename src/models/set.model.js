import mongoose, { Schema } from 'mongoose';

const setSchema = new Schema(
  {
    title: String,
    description: String,
    userId: Schema.Types.ObjectId,
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Set = mongoose.model('Set', setSchema);

export default Set;
