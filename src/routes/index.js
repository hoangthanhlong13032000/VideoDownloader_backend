const videoRouters = require('./video');
const authRouters = require('./auth');
const suggestRouters = require('./suggest')

route = (app) => {
  app.use('/api/suggest', suggestRouters);
  app.use('/api/video', videoRouters);
  app.use('/auth', authRouters)
  app.get('/health', (req, res) => {
    res.status(200).send('ok')
  })
}

module.exports = route
