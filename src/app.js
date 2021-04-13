import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';

import { PORT } from './utils/secrets';
import configurePassportAuth from './config/passport';

const app = express();

// mongoose connect
import './database/mongoose';

// configure passport
configurePassportAuth(passport);

// App configurations
app.set('port', PORT);
app.use(passport.initialize());
app.use(helmet());
app.use(compression());
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import userRoutes from './routes/user.route';
import setRoutes from './routes/set.route';

// Primary app routes
app.use('/v1/users', userRoutes);
app.use('/v1', setRoutes);

export default app;
