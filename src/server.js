import errorHandler from './middlewares/error.middleware';
import app from './app';

// Error Handling
app.use(errorHandler);

// Start the express server
const server = app.listen(app.get('port'), () => {
  console.log(`App is running at http://localhost:${app.set('port')} in ${app.get('env')}`);
  console.log('Press CTRL + C to stop ...');
});

export default server;
