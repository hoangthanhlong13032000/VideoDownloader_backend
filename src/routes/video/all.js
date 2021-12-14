const youtube = require('../../downloaders/youtube');
const tiktok = require('../../downloaders/tiktok');
const facebook = require('../../downloaders/facebook')

const getVideoByUrl = async (req, res) => {
    const url = req.body.url;

    if (!url || (typeof url !== 'string')) {
        res.status(400).send({ status: 0, data: {}, message: 'Url is required!' })
    }

    let downloader = undefined;

    if (youtube.validate.URL(url)) downloader = youtube;
    else if (tiktok.validate.URL(url)) downloader = tiktok;
    else if (facebook.validate.URL(url)) downloader = facebook;
    // more platforms here
    else res.status(400).send({ status: 0, data: {}, message: 'Domain is not supported!' });


    if (downloader) {
        downloader.getVideoInfo(url)
            .then(info => {
                res.status(200).send({ status: 1, data: info, message: '' })
            })
            .catch(err => {
                res.status(400).send({ status: 0, data: {}, message: err.message })
            });
    }
}

module.exports = { getVideoByUrl }