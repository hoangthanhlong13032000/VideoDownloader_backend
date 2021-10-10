const router = require('express').Router();
const youtube = require('./youtube');
const facebook = require('./facebook');
const all = require('./all');


router.route('/all').post(all.getVideoByUrl);
router.route('/youtube').get(youtube.getVideoById);
router.route('/facebook').get(facebook.getVideoById);


module.exports = router;
