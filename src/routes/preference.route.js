import { Router } from 'express';
import passport from 'passport';

import * as preferenceControllers from '../controllers/preference.controller';

const route = new Router();

route.put(
  '/',
  passport.authenticate('jwt', { session: false }),
  preferenceControllers.changePreferences
);
route.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  preferenceControllers.getPreferences
);

export default route;
