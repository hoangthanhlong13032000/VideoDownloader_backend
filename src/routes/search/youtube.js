const youtube = require('../../downloaders/youtube');

const searchVideos = async (req, res) => {
    const search_query = req.query.search_query || "";
    youtube.searchVideoRenderer(search_query)
        .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
        .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
}

const trendingVideos = async (req, res) => {
    youtube.searchVideoRenderer("", youtube.constant.TRENDING_URL)
        .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
        .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
}

const musicVideos = async (req, res) => {
    youtube.searchVideoRenderer("", youtube.constant.MUSIC_URL)
        .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
        .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
}

const gamingVideos = async (req, res) => {
    youtube.searchVideoRenderer("", youtube.constant.GAMING_URL)
        .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
        .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
}

const movieVideos = async (req, res) => {
    youtube.searchVideoRenderer("", youtube.constant.MOVIE_URL)
        .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
        .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
}
module.exports = { searchVideos , trendingVideos, musicVideos, gamingVideos, movieVideos}