const router = require('express').Router();
const youtube = require('./youtube');

router.route('/youtube').get(youtube.searchVideos);
router.route('/youtube/trending').get(youtube.trendingVideos);
router.route('/youtube/music').get(youtube.musicVideos);
router.route('/youtube/movie').get(youtube.movieVideos);
router.route('/youtube/gaming').get(youtube.gamingVideos);

module.exports = router;