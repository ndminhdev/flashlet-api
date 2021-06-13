import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';
import { clearCache } from '../services/cache';

const route = new Router();

route.post(
  '/sets',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  setControllers.createSet
);
route.get('/sets/subject/:keyword', setControllers.searchSets);
route.get('/sets', passport.authenticate('jwt', { session: false }), setControllers.getMySets);
route.get('/sets/:setId', setControllers.getSetById);
route.put(
  '/sets/:setId',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  setControllers.updateSet
);
route.delete(
  '/sets/:setId',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  setControllers.deleteSet
);
route.post(
  '/sets/:setId/cards',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  uploader.single('image'),
  setControllers.addCard
);
route.put(
  '/cards/:cardId',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  uploader.single('image'),
  setControllers.editCard
);
route.delete(
  '/cards/:cardId',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username, field: 'sets' });
    next();
  },
  setControllers.removeCard
);
route.get(
  '/sets/check/:setId',
  passport.authenticate('jwt', { session: false }),
  setControllers.checkSetOwner
);

export default route;
