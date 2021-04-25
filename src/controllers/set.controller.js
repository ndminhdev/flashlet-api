import { Types } from 'mongoose';
import escapeStringRegexp from 'escape-string-regexp';

import Set from '../models/set.model';
import Card from '../models/card.model';
import HttpError from '../utils/httpError';
import { setSchema, cardSchema } from '../utils/validate';
import streamUpload, { deleteFile } from '../utils/uploader';

/**
 * Create a new study set
 */
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

/**
 * Search sets by title
 */
export const searchSets = async (req, resp, next) => {
  const { keyword } = req.params;
  const { sortBy = 'title', orderBy = 1, limit = 8, page = 1 } = req.query;

  try {
    const $regex = escapeStringRegexp(keyword);
    const agg = await Set.aggregate([
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
    const setsCount = agg.length > 0 ? agg[0].setsCount : 0;
    const totalPage =
      setsCount % +limit === 0
        ? Math.floor(setsCount / +limit)
        : Math.floor(setsCount / +limit) + 1;
    const hasNextPage = +page < totalPage;

    const sets = await Set.aggregate([
      {
        $match: {
          title: { $regex, $options: 'i' },
          isPublic: true
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'setId',
          as: 'cards'
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          user: '$user',
          termsCount: { $size: '$cards' },
          previewTerms: { $slice: ['$cards', 4] },
          createdAt: 1
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0,
          'previewTerms.__v': 0
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

/**
 * Get my own sets
 */
export const getMySets = async (req, resp, next) => {
  const { sortBy = 'title', orderBy = 1, limit = 8, page = 1 } = req.query;

  try {
    const agg = await Set.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $count: 'setsCount'
      }
    ]);
    const setsCount = agg.length > 0 ? agg[0].setsCount : 0;
    const totalPage =
      setsCount % +limit === 0
        ? Math.floor(setsCount / +limit)
        : Math.floor(setsCount / +limit) + 1;
    const hasNextPage = +page < totalPage;
    const sets = await Set.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'setId',
          as: 'cards'
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          termsCount: { $size: '$cards' },
          previewTerms: { $slice: ['$cards', 4] },
          isPublic: 1,
          user: '$user',
          createdAt: 1
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0,
          'previewTerms.__v': 0
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

/**
 * Get a set by id
 */
export const getSetById = async (req, resp, next) => {
  const { setId } = req.params;

  try {
    const agg = await Set.aggregate([
      {
        $match: {
          _id: Types.ObjectId(setId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'cards',
          localField: '_id',
          foreignField: 'setId',
          as: 'cards'
        }
      },
      {
        $project: {
          title: 1,
          description: 1,
          isPublic: 1,
          termsCount: { $size: '$cards' },
          cards: '$cards',
          user: '$user',
          createdAt: 1
        }
      },
      {
        $project: {
          'user.password': 0,
          'user.tokens': 0,
          'user.createdAt': 0,
          'user.updatedAt': 0,
          'user.__v': 0,
          'cards.__v': 0
        }
      }
    ]);

    const set = agg[0];

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

/**
 * Update a set with its cards
 */
export const updateSet = async (req, resp, next) => {
  const { setId } = req.params;
  const { title, description, isPublic } = req.body;

  try {
    const { errors, value } = await setSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const set = await Set.findOne({ _id: setId, userId: req.user._id });

    if (!set) {
      throw new HttpError(404, 'Set is not found or You can access this set');
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

/**
 * Delete a set
 */
export const deleteSet = async (req, resp, next) => {
  const { setId } = req.params;

  try {
    const set = await Set.findOne({ _id: setId, userId: req.user._id });

    if (!set) {
      throw new HttpError(404, 'Set is not found or You can access this set');
    }

    await set.remove();
    resp.status(200).json({
      message: 'Your set has been deleted'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add a card to set
 */
export const addCard = async (req, resp, next) => {
  const { setId } = req.params;
  const { term, definition } = req.body;

  try {
    const set = await Set.findById(setId);

    if (!set) {
      throw new HttpError(404, 'Set is not found');
    }

    const { errors, value } = await cardSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const card = new Card({
      term,
      definition,
      setId: set._id
    });

    if (req.file) {
      const file = await streamUpload(req);
      card.imageUrl = file.secure_url;
    }

    await card.save();
    resp.status(201).json({
      message: 'Card created',
      data: {
        card
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Edit a card
 */
export const editCard = async (req, resp, next) => {
  const { cardId } = req.params;
  const { term, definition } = req.body;

  try {
    const { errors, value } = await cardSchema.validate(req.body);

    if (errors) {
      throw new HttpError(422, errors[0], value);
    }

    const card = await Card.findById(cardId);
    card.term = term;
    card.definition = definition;

    if (req.file) {
      if (card.imageUrl) {
        // eslint-disable-next-line no-useless-escape
        const regex = /[\/\.]/i;
        const index = card.imageUrl.split(regex).length - 2;
        const publicId = card.imageUrl.split(regex)[index];
        await deleteFile(publicId);
      }
      const data = await streamUpload(req);
      card.imageUrl = data.secure_url;
    }

    await card.save();
    resp.status(200).json({
      message: 'Card saved',
      data: {
        card
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Remove a card from set
 */
export const removeCard = async (req, resp, next) => {
  const { cardId } = req.params;

  try {
    const card = await Card.findById(cardId);
    await card.remove();
    resp.status(200).json({
      message: 'Card removed'
    });
  } catch (err) {
    next(err);
  }
};
