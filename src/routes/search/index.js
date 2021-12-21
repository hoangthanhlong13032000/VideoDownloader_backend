const router = require('express').Router();
const youtube = require('./youtube');

router.route('/youtube').get(youtube.searchVideos);


module.exports = router;
