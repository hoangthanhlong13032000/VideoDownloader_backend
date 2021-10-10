ytdl = require("ytdl-core");

const getVideoByUrl = async (req, res) => {
    const url = req.body.url;

    if(!url || !(typeof url === 'string')) {
        res.status(400).send({status: 0, data: {}, message: 'Url is required!'})
    }

    await ytdl.getInfo(url).then(info => {
        res.status(200).send({status: 1, data: info.formats, message: ''})
    }).catch(
        err => {
            res.status(400).send({status: 0, data: {}, message: err.toString()})
        }
    )
}

module.exports = { getVideoByUrl }