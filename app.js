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

const youtube = require('./src/downloaders/youtube');
const ytCachedVideo = {
  "": [],
  trending: [],
  music: [],
  movie: [],
  gaming: [],
}
app.get('/api/search/youtube', async function (req, res) {
  const search_query = req.query.search_query || "";
    if(!search_query) {
      res.status(200).send({ status: 1, data: ytCachedVideo[""], message: '' });
    } else {
      youtube.searchVideoRenderer(search_query)
      .then(videos => { res.status(200).send({ status: 1, data: videos, message: '' }); })
      .catch(err => { res.status(400).send({ status: 0, data: [], message: err.message }); })
    }
});

app.get('/api/search/youtube/:type', async function (req, res) {
  const type = req.params.type;

  if (!ytCachedVideo[type]) {
      res.status(200).send({ status: 1, data: ytCachedVideo[""], message: '' });
  } else {
    res.status(200).send({ status: 1, data: ytCachedVideo[type] || [], message: ''});
  }
});

const getCachedVideos = () => {
  youtube.searchVideoRenderer("").then(
    videos => { if(videos.length) ytCachedVideo[""] = videos; }
  )
  youtube.searchVideoRenderer("", youtube.constant.TRENDING_URL).then(
    videos => { if(videos.length) ytCachedVideo.trending = videos; }
  )
  youtube.searchVideoRenderer("", youtube.constant.MUSIC_URL).then(
    videos => { if(videos.length) ytCachedVideo.music = videos; }
  )
  youtube.searchVideoRenderer("", youtube.constant.GAMING_URL).then(
    videos => { if(videos.length) ytCachedVideo.gaming = videos; }
  )
  youtube.searchVideoRenderer("", youtube.constant.MOVIE_URL).then(
    videos => { if(videos.length) ytCachedVideo.movie = videos; }
  )
}

getCachedVideos();
const cron = require('node-cron');
cron.schedule('*/10 * * * *', async () => {
  getCachedVideos();
}, {
  scheduled: true,
  timezone: "Asia/Ho_Chi_Minh"
})

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`✅ Server is listening on port ${port}`))