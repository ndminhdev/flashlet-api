import Set from '../models/set.model';
import HttpError from '../utils/httpError';
import { createSetSchema } from '../utils/validate';

export const createSet = async (req, resp, next) => {
  const { title, description, isPublic } = req.body;

  try {
    const { errors, value } = await createSetSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const set = new Set({
      title,
      description,
      userId: req.user._id,
      isPublic
    });

    await set.save();
    resp.status(201).json({
      message: 'Your set has been created',
      data: {
        set
      }
    });
  } catch (err) {
    next(err);
  }
};
