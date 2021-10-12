const ytdl = require('ytdl-core');
const url = 'https://www.youtube.com/watch?v='

const getVideoById = async (req, res) => {
    const id = req.query.id;

    if(!id || !(typeof id === 'string')) res.status(400).send({status: 0, data: {}, message: 'ID is required!'});
    else {
        ytdl.getInfo(url + id).then(info => {
            res.status(200).send({status: 1, data: {formats: info.formats,videoDetails: info.videoDetails, related_videos: info.related_videos}, message: ''})
        }).catch(
            err => {
                res.status(400).send({status: 0, data: {}, message: err.toString()})
            }
        )
    }
}

module.exports = { getVideoById }