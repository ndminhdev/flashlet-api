import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';

const route = new Router();

route.post('/sets', passport.authenticate('jwt', { session: false }), setControllers.createSet);
route.get('/sets/subject/:keyword', setControllers.searchSets);
route.get('/sets', passport.authenticate('jwt', { session: false }), setControllers.getMySets);
route.get('/sets/:setId', setControllers.getSetById);
route.put(
  '/sets/:setId',
  passport.authenticate('jwt', { session: false }),
  setControllers.updateSet
);
route.delete(
  '/sets/:setId',
  passport.authenticate('jwt', { session: false }),
  setControllers.deleteSet
);
route.post(
  '/sets/:setId/cards',
  passport.authenticate('jwt', { session: false }),
  uploader.single('image'),
  setControllers.addCard
);
route.put(
  '/cards/:cardId',
  passport.authenticate('jwt', { session: false }),
  uploader.single('image'),
  setControllers.editCard
);
route.delete(
  '/cards/:cardId',
  passport.authenticate('jwt', { session: false }),
  setControllers.removeCard
);

export default route;
