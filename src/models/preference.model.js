import mongoose, { Schema } from 'mongoose';

const preferenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    require: true
  },
  darkMode: {
    type: Boolean,
    default: false
  }
});

preferenceSchema.methods.toJSON = function () {
  const user = this;
  const obj = user.toObject();
  delete obj.userId;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Preference = mongoose.model('Preference', preferenceSchema);

export default Preference;
