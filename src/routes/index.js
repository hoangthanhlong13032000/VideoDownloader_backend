const videoRouters = require('./video');
const authRouters = require('./auth');
const suggestRouters = require('./suggest')

route = (app) => {
  app.use('/api/suggest', suggestRouters);
  app.use('/api/video', videoRouters);
  app.use('/auth', authRouters)
}

module.exports = route
