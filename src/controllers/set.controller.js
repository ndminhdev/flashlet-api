import escapeStringRegexp from 'escape-string-regexp';

import Set from '../models/set.model';
import HttpError from '../utils/httpError';
import { setSchema } from '../utils/validate';
import streamUpload from '../utils/uploader';

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

// search sets by title with keyword
export const searchSets = async (req, resp, next) => {
  const { keyword } = req.params;
  const { sortBy = 'title', orderBy = 1, limit = 8, page = 1 } = req.query;

  try {
    const $regex = escapeStringRegexp(keyword);
    const [{ setsCount }] = await Set.aggregate([
      {
        $match: {
          title: { $regex, $options: 'i' },
          isPublic: true
        }
      },
      {
        $count: 'setsCount'
      }
    ]);

    const hasNextPage = !(Math.floor(setsCount / limit) + 1 === +page);

    const sets = await Set.aggregate([
      {
        $match: {
          title: { $regex, $options: 'i' },
          isPublic: true
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          termsCount: { $size: '$cards' },
          previewTerms: { $slice: ['$cards', 4] },
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] }
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0
        }
      },
      {
        $sort: { [sortBy]: +orderBy }
      },
      {
        $skip: (+page - 1) * +limit
      },
      {
        $limit: +limit
      }
    ]);

    resp.status(200).json({
      message: `Search sets with keyword "${keyword}"`,
      data: {
        hasNextPage,
        setsCount,
        sets
      }
    });
  } catch (err) {
    next(err);
  }
};

// get my sets
export const getMySets = async (req, resp, next) => {
  const { sortBy = 'title', orderBy = 1, limit = 8, page = 1 } = req.query;

  try {
    const [{ setsCount }] = await Set.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $count: 'setsCount'
      }
    ]);

    const hasNextPage = Math.floor(setsCount / limit) + 1 === +page;

    const sets = await Set.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          termsCount: { $size: '$cards' },
          previewTerms: { $slice: ['$cards', 4] },
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'id',
          as: 'user'
        }
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] }
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0
        }
      },
      {
        $sort: { [sortBy]: +orderBy }
      },
      {
        $skip: (+page - 1) * +limit
      },
      {
        $limit: +limit
      }
    ]);

    resp.status(200).json({
      message: 'Get my sets',
      data: {
        hasNextPage,
        setsCount,
        sets
      }
    });
  } catch (err) {
    next(err);
  }
};

// get a set by id
export const getSetById = async (req, resp, next) => {
  const { setId } = req.params;

  try {
    const set = await Set.findById(setId);

    if (req.user && !set.isPublic) {
      throw new HttpError(403, 'You cannot access this set');
    }

    if (!set) {
      throw new HttpError(404, 'Set is not found');
    }

    resp.status(200).json({
      message: 'Get a set',
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

// delete a set
export const deleteSet = async (req, resp, next) => {
  const { setId } = req.params;

  try {
    const { errors, value } = await setSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const set = await Set.findById(setId);
    await set.remove();
    resp.status(200).json({
      message: 'Your set has been deleted'
    });
  } catch (err) {
    next(err);
  }
};

// add new card to a set
export const addCard = async (req, resp, next) => {
  const { setId } = req.params;
  const { term, definition } = req.body;

  try {
    const set = await Set.findById(setId);

    if (!set) {
      throw new HttpError(404, 'Set is not found');
    }

    const card = {
      term,
      definition
    };

    if (req.file) {
      const file = await streamUpload(req);
      card.image = file.secure_url;
    }

    set.cards = set.cards.concat(card);
    await set.save();
    resp.status(201).json({
      message: 'Card added to set',
      data: {
        card: set.cards[set.cards.length - 1]
      }
    });
  } catch (err) {
    next(err);
  }
};

// delete a card from a set
export const deleteCard = async (req, resp, next) => {
  const { setId, cardId } = req.params;

  try {
    const set = await Set.findById(setId);

    if (!set) {
      throw new HttpError(404, 'Set is not found');
    }

    await set.cards.id(cardId).remove();

    await set.save();
    resp.status(200).json({
      message: 'Card deleted from set'
    });
  } catch (err) {
    next(err);
  }
};
