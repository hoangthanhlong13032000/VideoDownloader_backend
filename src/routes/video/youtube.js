const youtube = require('../../downloaders/youtube');

const getVideoById = async (req, res) => {
    const id = req.query.id;

    if (!id) res.status(400).send({ status: 0, data: {}, message: 'ID is required!' });
    else {
        youtube.getVideoInfo(id)
            .then(info => { res.status(!info.status ? 400 : 200).send({ status: info.status, data: info, message: '' }); })
            .catch(err => { res.status(400).send({ status: 0, data: {}, message: err.message }); })
    }
}

module.exports = { getVideoById }