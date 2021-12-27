/**
dotenv module to use custom environments define in .env file
*/
const dotenv = require('dotenv')
dotenv.config();


/**
connect to mongodb database
*/
// const database = require("./src/config/database");
// database.connect();


/**
rest api app with expressJs
*/
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:8080");
	res.header(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept"
	);
	next();
});


/**
route app (define get, post, put, ... request, response)
*/
const routes = require('./src/routes');

routes(app);

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`✅ Server is listening on port ${port}`))

const youtube = require('./src/downloaders/youtube');
const ytCachedVideo = {
	"": [],
	trending: [],
	music: [],
	movie: [],
	gaming: [],
}
app.get('/api/search/youtube', async function (req, res) {
	const search_query = req.query.search_query;
	if (!search_query) {
		const from = req.query.from || 0;
		const to = req.query.to || ytCachedVideo[""].length;
		res.status(200).send({ status: 1, data: ytCachedVideo[""].slice(from, to), message: '' });
	} else {
		youtube.searchVideoRenderer(search_query)
			.then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
			.catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
	}
});

app.get('/api/search/youtube/:type', async function (req, res) {
	const videos = ytCachedVideo[req.params.type] || ytCachedVideo[""];
	const from = req.query.from || 0;
	const to = req.query.to || videos.length;

	res.status(200).send({ status: 1, data: videos.slice(from, to), message: '' });
});

const getCachedVideos = () => {
	[
		{ type: "", url: undefined },
		{ type: "trending", url: youtube.constant.TRENDING_URL },
		{ type: "music", url: youtube.constant.MUSIC_URL },
		{ type: "gaming", url: youtube.constant.GAMING_URL },
		{ type: "movie", url: youtube.constant.MOVIE_URL },
	].forEach(pair => {
		youtube.searchVideoRenderer("", pair.url).then(
			videos => { if (videos.length) ytCachedVideo[pair.type] = videos }
		)
	})
}

getCachedVideos();
const cron = require('node-cron');
cron.schedule('*/10 * * * *', async () => {
	getCachedVideos();
}, {
	scheduled: true,
	timezone: "Asia/Ho_Chi_Minh"
})