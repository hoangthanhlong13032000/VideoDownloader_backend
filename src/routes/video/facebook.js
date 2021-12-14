const facebook = require('../../downloaders/facebook');

const getVideoById = async (req, res) => {
    const id = req.query.id;

    if(!id || !(typeof id === 'string')) res.status(400).send({status: 0, data: {}, message: 'ID is required!'})
    else {
        facebook.getVideoInfo(id)
            .then(info => { res.status(!info.status ? 400 : 200).send({ status: info.status, data: info, message: '' }); })
            .catch(err => { res.status(400).send({ status: 0, data: {}, message: err.message }); })
    }
}

module.exports = { getVideoById }