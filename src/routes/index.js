const videoRouters = require('./video');

route = (app) => {
  app.use('/api/video/', videoRouters);
}

module.exports = route