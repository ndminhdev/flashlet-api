import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';

const route = new Router();

route.post('/', passport.authenticate('jwt', { session: false }), setControllers.createSet);
route.get('/subject/:keyword', setControllers.searchSets);
route.get('/', passport.authenticate('jwt', { session: false }), setControllers.getMySets);
route.get('/:setId', setControllers.getSetById);
route.put('/:setId', passport.authenticate('jwt', { session: false }), setControllers.updateSet);
route.delete('/:setId', passport.authenticate('jwt', { session: false }), setControllers.deleteSet);
route.post(
  '/upload-image',
  passport.authenticate('jwt', { session: false }),
  uploader.single('image'),
  setControllers.uploadCardImage
);

export default route;
