import Set from '../models/set.model';
import HttpError from '../utils/httpError';
import { setSchema } from '../utils/validate';

// create a new set
export const createSet = async (req, resp, next) => {
  const { title, description, isPublic } = req.body;

  try {
    const { errors, value } = await setSchema.validate(req.body);

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

// update a set
export const updateSet = async (req, resp, next) => {
  const { setId } = req.params;
  const { title, description, isPublic } = req.body;

  try {
    const { errors, value } = await setSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const set = await Set.findById(setId);

    if (!set) {
      throw new HttpError(404, 'Set is not found');
    }

    set.title = title;
    set.description = description;
    set.isPublic = isPublic;

    await set.save();
    resp.status(200).json({
      message: 'Your set has been saved',
      data: {
        set
      }
    });
  } catch (err) {
    next(err);
  }
};
