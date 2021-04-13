import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';

const route = new Router();

route.post('/sets', passport.authenticate('jwt', { session: false }), setControllers.createSet);
route.get('/subject/:keyword', setControllers.searchSets);
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
route.delete(
  '/sets/:setId/cards/:cardId',
  passport.authenticate('jwt', { session: false }),
  setControllers.deleteCard
);

export default route;
