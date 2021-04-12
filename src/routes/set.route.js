import { Router } from 'express';
import passport from 'passport';

// import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';

const route = new Router();

route.post('/', passport.authenticate('jwt', { session: false }), setControllers.createSet);
route.put('/:setId', passport.authenticate('jwt', { session: false }), setControllers.updateSet);

export default route;
