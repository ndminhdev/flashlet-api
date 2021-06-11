import { Router } from 'express';
import passport from 'passport';

import { uploader } from '../utils/uploader';
import * as userControllers from '../controllers/user.controller';
import { clearCache } from '../services/cache';

const route = new Router();

route.post('/signup', userControllers.createAccount);
route.post('/signin', userControllers.signIn);
route.post('/signin/google', userControllers.signInWithGoogle);
route.post('/signin/facebook', userControllers.signInWithFacebook);
route.delete('/signout', passport.authenticate('jwt', { session: false }), userControllers.signOut);
route.delete(
  '/signout/all',
  passport.authenticate('jwt', { session: false }),
  userControllers.signOutAll
);
route.get('/:username', userControllers.getUserProfile);
route.get('/:username/sets', userControllers.getPublicSetsOfAnUser);
route.post('/password/forgot', userControllers.forgotPassword);
route.post('/password/reset', userControllers.resetPassword);
route.post(
  '/password/change',
  passport.authenticate('jwt', { session: false }),
  userControllers.changePassword
);
route.patch(
  '/me',
  passport.authenticate('jwt', { session: false }),
  uploader.single('profileImage'),
  (req, resp, next) => {
    clearCache({ key: req.user.username, fields: ['profile'] });
    next();
  },
  userControllers.changeProfile
);
route.delete(
  '/me',
  passport.authenticate('jwt', { session: false }),
  (req, resp, next) => {
    clearCache({ key: req.user.username });
    next();
  },
  userControllers.removeAccount
);

export default route;
