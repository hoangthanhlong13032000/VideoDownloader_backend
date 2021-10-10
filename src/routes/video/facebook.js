
const getVideoById = async (req, res) => {
    const id = req.body.id;

    if(!id) {
        res.status(400).send({status: 0, data: {}, message: 'Video not found!'})
    }

    res.status(200).send({status: 1, data: {}, message: ''})
}

module.exports = { getVideoById }