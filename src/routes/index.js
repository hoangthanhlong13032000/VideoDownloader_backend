const videoRouters = require('./video');
const authRouters = require('./auth')

route = (app) => {
  app.use('/api/video', videoRouters);
  app.use('/auth', authRouters)
}

module.exports = route
