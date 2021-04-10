import { Router } from 'express';
import passport from 'passport';

// import { uploader } from '../utils/uploader';
import * as setControllers from '../controllers/set.controller';

const route = new Router();

route.post('/', passport.authenticate('jwt', { session: false }), setControllers.createSet);

export default route;
