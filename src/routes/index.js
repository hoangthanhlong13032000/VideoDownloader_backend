const videoRouters = require('./video');
const searchRouters = require('./search');
const authRouters = require('./auth');

route = (app) => {
  app.use('/api/video', videoRouters);
  app.use('/api/search', searchRouters);
  app.use('/auth', authRouters)
}

module.exports = route
