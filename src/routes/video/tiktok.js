const tiktok = require('../../downloaders/tiktok');
const TIKTOK_URL = 'https://www.tiktok.com';

const getVideoById = async (req, res) => {
    const id = req.query.id;
    const user = req.query.user;

    if (!id || !user) res.status(400).send({status: 0, data: {}, message: 'ID and USER are required!'});
    else {
        tiktok.getVideoInfo(`${TIKTOK_URL}/${user}/video/${id}`)
            .then(info => {res.status(!info.status ? 400 : 200).send({status: info.status, data: info, message: ''});})
            .catch(err => {res.status(400).send({status: 0, data: {}, message: err.message});})
    }
}

module.exports = {getVideoById}